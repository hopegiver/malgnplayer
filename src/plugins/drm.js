export class DRMPlugin {
    constructor() {
        this.video = null;
        this.core = null;
        this.drmConfig = null;
        this.mediaKeys = null;
        this.keySession = null;
        this.licenseServerUrl = null;
        this.certificateUrl = null;
    }

    init(core) {
        this.core = core;
    }

    canPlay(source) {
        if (!source || !source.drm) return false;

        // Check if EME is supported
        if (!window.navigator.requestMediaKeySystemAccess) {
            console.warn('Encrypted Media Extensions (EME) not supported');
            return false;
        }

        // Check supported DRM systems
        const supportedSystems = ['com.widevine.alpha', 'com.microsoft.playready'];
        return source.drm && supportedSystems.some(system =>
            source.drm[system] || source.drm.keySystem === system
        );
    }

    async load(source, videoElement) {
        this.video = videoElement;
        this.drmConfig = source.drm;

        if (!this.drmConfig) {
            throw new Error('No DRM configuration provided');
        }

        try {
            await this.setupDRM();
            return true;
        } catch (error) {
            throw new Error('Failed to setup DRM: ' + error.message);
        }
    }

    async setupDRM() {
        const keySystemConfigs = this.createKeySystemConfigs();

        for (const config of keySystemConfigs) {
            try {
                const keySystemAccess = await navigator.requestMediaKeySystemAccess(
                    config.keySystem,
                    config.configurations
                );

                this.mediaKeys = await keySystemAccess.createMediaKeys();
                await this.video.setMediaKeys(this.mediaKeys);

                this.setupEncryptedEventListener();

                if (this.core) {
                    this.core.emit('drmReady', {
                        keySystem: config.keySystem
                    });
                }

                return;
            } catch (error) {
                console.warn(`Failed to setup DRM with ${config.keySystem}:`, error);
                continue;
            }
        }

        throw new Error('No supported DRM system found');
    }

    createKeySystemConfigs() {
        const configs = [];

        // Widevine configuration
        if (this.drmConfig['com.widevine.alpha'] || this.drmConfig.keySystem === 'com.widevine.alpha') {
            const widevineConfig = this.drmConfig['com.widevine.alpha'] || this.drmConfig;
            configs.push({
                keySystem: 'com.widevine.alpha',
                configurations: [{
                    initDataTypes: ['cenc'],
                    audioCapabilities: [{
                        contentType: 'audio/mp4; codecs="mp4a.40.2"',
                        robustness: widevineConfig.audioRobustness || 'SW_SECURE_CRYPTO'
                    }],
                    videoCapabilities: [{
                        contentType: 'video/mp4; codecs="avc1.640028"',
                        robustness: widevineConfig.videoRobustness || 'SW_SECURE_DECODE'
                    }],
                    distinctiveIdentifier: widevineConfig.distinctiveIdentifier || 'optional',
                    persistentState: widevineConfig.persistentState || 'optional',
                    sessionTypes: ['temporary']
                }]
            });
            this.licenseServerUrl = widevineConfig.licenseServerUrl;
            this.certificateUrl = widevineConfig.certificateUrl;
        }

        // PlayReady configuration
        if (this.drmConfig['com.microsoft.playready'] || this.drmConfig.keySystem === 'com.microsoft.playready') {
            const playreadyConfig = this.drmConfig['com.microsoft.playready'] || this.drmConfig;
            configs.push({
                keySystem: 'com.microsoft.playready',
                configurations: [{
                    initDataTypes: ['cenc'],
                    audioCapabilities: [{
                        contentType: 'audio/mp4; codecs="mp4a.40.2"',
                        robustness: playreadyConfig.audioRobustness || 'SW_SECURE_CRYPTO'
                    }],
                    videoCapabilities: [{
                        contentType: 'video/mp4; codecs="avc1.640028"',
                        robustness: playreadyConfig.videoRobustness || 'SW_SECURE_DECODE'
                    }],
                    distinctiveIdentifier: playreadyConfig.distinctiveIdentifier || 'optional',
                    persistentState: playreadyConfig.persistentState || 'optional',
                    sessionTypes: ['temporary']
                }]
            });
            this.licenseServerUrl = playreadyConfig.licenseServerUrl;
            this.certificateUrl = playreadyConfig.certificateUrl;
        }

        return configs;
    }

    setupEncryptedEventListener() {
        this.video.addEventListener('encrypted', async (event) => {
            try {
                await this.handleEncryptedEvent(event);
            } catch (error) {
                if (this.core) {
                    this.core.emit('drmError', {
                        type: 'KEY_SESSION_ERROR',
                        message: error.message
                    });
                }
            }
        });
    }

    async handleEncryptedEvent(event) {
        if (!this.mediaKeys) {
            throw new Error('MediaKeys not initialized');
        }

        this.keySession = this.mediaKeys.createSession();

        this.keySession.addEventListener('message', async (messageEvent) => {
            try {
                await this.handleLicenseRequest(messageEvent);
            } catch (error) {
                if (this.core) {
                    this.core.emit('drmError', {
                        type: 'LICENSE_REQUEST_ERROR',
                        message: error.message
                    });
                }
            }
        });

        this.keySession.addEventListener('keystatuseschange', (event) => {
            this.handleKeyStatusChange(event);
        });

        await this.keySession.generateRequest(event.initDataType, event.initData);
    }

    async handleLicenseRequest(messageEvent) {
        if (!this.licenseServerUrl) {
            throw new Error('License server URL not configured');
        }

        const headers = {
            'Content-Type': 'application/octet-stream'
        };

        // Add custom headers if provided
        if (this.drmConfig.headers) {
            Object.assign(headers, this.drmConfig.headers);
        }

        const response = await fetch(this.licenseServerUrl, {
            method: 'POST',
            headers: headers,
            body: messageEvent.message
        });

        if (!response.ok) {
            throw new Error(`License request failed: ${response.status} ${response.statusText}`);
        }

        const license = await response.arrayBuffer();
        await this.keySession.update(license);

        if (this.core) {
            this.core.emit('drmLicenseAcquired', {
                sessionId: this.keySession.sessionId
            });
        }
    }

    handleKeyStatusChange(event) {
        const keySession = event.target;

        for (const [keyId, status] of keySession.keyStatuses) {
            if (this.core) {
                this.core.emit('drmKeyStatusChange', {
                    keyId: this.arrayBufferToHex(keyId),
                    status: status
                });
            }

            if (status === 'expired' || status === 'internal-error') {
                if (this.core) {
                    this.core.emit('drmError', {
                        type: 'KEY_STATUS_ERROR',
                        keyId: this.arrayBufferToHex(keyId),
                        status: status
                    });
                }
            }
        }
    }

    arrayBufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    getDrmInfo() {
        if (!this.mediaKeys || !this.keySession) {
            return null;
        }

        return {
            keySystem: this.mediaKeys.keySystem,
            sessionId: this.keySession.sessionId,
            licenseServerUrl: this.licenseServerUrl
        };
    }

    async renewLicense() {
        if (!this.keySession) {
            throw new Error('No active key session');
        }

        try {
            // Force renewal by closing and recreating session
            await this.keySession.close();
            // Session will be recreated on next encrypted event
            if (this.core) {
                this.core.emit('drmLicenseRenewed');
            }
        } catch (error) {
            throw new Error('Failed to renew license: ' + error.message);
        }
    }

    destroy() {
        if (this.keySession) {
            this.keySession.close().catch(() => {});
            this.keySession = null;
        }

        if (this.video && this.video.setMediaKeys) {
            this.video.setMediaKeys(null).catch(() => {});
        }

        this.mediaKeys = null;
        this.drmConfig = null;
        this.licenseServerUrl = null;
        this.certificateUrl = null;
    }
}