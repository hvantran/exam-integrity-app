import { getGatewayBaseUrl } from './gateway';

describe('getGatewayBaseUrl', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete (window as any).location;
    delete (window as any)._env_;
    process.env.REACT_APP_GATEWAY_URL = '';
  });

  afterEach(() => {
    (window as any).location = originalLocation;
    delete (window as any)._env_;
    process.env.REACT_APP_GATEWAY_URL = '';
  });

  it('returns empty string in production/Docker container on port 6090 (same-origin proxy)', () => {
    window.location = {
      ...originalLocation,
      origin: 'http://localhost:6090',
      hostname: 'localhost',
      port: '6090',
      protocol: 'http:',
    } as any;

    expect(getGatewayBaseUrl()).toBe('');
  });

  it('returns empty string when accessed via LAN IP even if env specifies localhost:6081', () => {
    window.location = {
      ...originalLocation,
      origin: 'http://192.168.1.6:6090',
      hostname: '192.168.1.6',
      port: '6090',
      protocol: 'http:',
    } as any;
    (window as any)._env_ = {
      REACT_APP_GATEWAY_URL: 'http://localhost:6081',
    };

    expect(getGatewayBaseUrl()).toBe('');
  });

  it('returns localhost:6081 when running locally on port 3000', () => {
    window.location = {
      ...originalLocation,
      origin: 'http://localhost:3000',
      hostname: 'localhost',
      port: '3000',
      protocol: 'http:',
    } as any;

    expect(getGatewayBaseUrl()).toBe('http://localhost:6081');
  });

  it('honors custom non-localhost gateway URL', () => {
    window.location = {
      ...originalLocation,
      origin: 'http://localhost:6090',
      hostname: 'localhost',
      port: '6090',
      protocol: 'http:',
    } as any;
    (window as any)._env_ = {
      REACT_APP_GATEWAY_URL: 'https://gateway.prod.example.com',
    };

    expect(getGatewayBaseUrl()).toBe('https://gateway.prod.example.com');
  });

  it('returns LAN gateway URL when running on dev server (port 3000) from LAN IP', () => {
    window.location = {
      ...originalLocation,
      origin: 'http://192.168.1.6:3000',
      hostname: '192.168.1.6',
      port: '3000',
      protocol: 'http:',
    } as any;
    (window as any)._env_ = {
      REACT_APP_GATEWAY_URL: 'http://localhost:6081',
    };

    expect(getGatewayBaseUrl()).toBe('http://192.168.1.6:6081');
  });
});
