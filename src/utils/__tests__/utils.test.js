import {
  validacaoSenha,
  validacaoEmail,
  obterNumeroDia,
  formatarData,
  formatarHora,
  getColorForEspecialidade,
} from '../utils';

describe('Validações Críticas', () => {
  describe('validacaoSenha', () => {
    test('aceita senhas válidas', () => {
      expect(validacaoSenha('Senha@123').valida).toBe(true);
      expect(validacaoSenha('Teste#456').valida).toBe(true);
      expect(validacaoSenha('Admin$789').valida).toBe(true);
    });

    test('rejeita senhas inválidas', () => {
      expect(validacaoSenha('123').valida).toBe(false);
      expect(validacaoSenha('senhafraca').valida).toBe(false);
      expect(validacaoSenha('SemNumero@').valida).toBe(false);
      expect(validacaoSenha('SemEspecial123').valida).toBe(false);
      expect(validacaoSenha('SEMMINUS123@').valida).toBe(false);
    });
  });

  describe('validacaoEmail', () => {
    test('aceita emails válidos', () => {
      expect(validacaoEmail('teste@email.com').valido).toBe(true);
      expect(validacaoEmail('usuario@dominio.com.br').valido).toBe(true);
      expect(validacaoEmail('nome.sobrenome@empresa.org').valido).toBe(true);
    });

    test('rejeita emails inválidos', () => {
      expect(validacaoEmail('invalido').valido).toBe(false);
      expect(validacaoEmail('@email.com').valido).toBe(false);
      expect(validacaoEmail('teste@').valido).toBe(false);
      expect(validacaoEmail('teste@.com').valido).toBe(false);
    });
  });

  describe('obterNumeroDia', () => {
    test('retorna número correto dos dias', () => {
      expect(obterNumeroDia('Domingo').numero).toBe(0);
      expect(obterNumeroDia('Segunda').numero).toBe(1);
      expect(obterNumeroDia('Terca').numero).toBe(2);
      expect(obterNumeroDia('Sabado').numero).toBe(6);
    });

    test('retorna erro para dia inválido', () => {
      expect(obterNumeroDia('DiaInvalido').sucesso).toBe(false);
    });
  });

  describe('formatarData', () => {
    test('formata datas válidas', () => {
      const resultado = formatarData('15/03/2024');
      expect(resultado.sucesso).toBe(true);
    });

    test('rejeita datas inválidas', () => {
      expect(formatarData('32/13/2024').sucesso).toBe(false);
      expect(formatarData('invalido').sucesso).toBe(false);
    });
  });

  describe('formatarHora', () => {
    test('formata horários válidos', () => {
      expect(formatarHora('14:30').sucesso).toBe(true);
      expect(formatarHora('09:00').sucesso).toBe(true);
    });

    test('rejeita horários inválidos', () => {
      expect(formatarHora('25:00').sucesso).toBe(false);
      expect(formatarHora('invalido').sucesso).toBe(false);
    });
  });

  describe('getColorForEspecialidade', () => {
    test('retorna cores para especialidades conhecidas', () => {
      const cor = getColorForEspecialidade('Pilates');
      expect(cor.backgroundColor).toBeDefined();
      expect(cor.textColor).toBeDefined();
    });

    test('retorna cor padrão para especialidade desconhecida', () => {
      const cor = getColorForEspecialidade('Desconhecida');
      expect(cor.backgroundColor).toBe('#3788d8');
    });
  });
});
