import axios from 'axios';

describe('API Dependencies', () => {
  test('axios está disponível', () => {
    expect(axios).toBeDefined();
    expect(typeof axios.create).toBe('function');
  });

  test('axios.create retorna uma instância válida', () => {
    const instance = axios.create({
      baseURL: 'http://test.com',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(instance).toBeDefined();
    expect(instance.defaults.baseURL).toBe('http://test.com');
  });
});
