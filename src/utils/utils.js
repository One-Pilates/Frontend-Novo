//validar a senha
export function validacaoSenha(senha) {
  const erros = [];

  if (senha.length < 8) {
    erros.push(`A senha precisa conter mais de 8 caracteres.`);
    return { valida: false, erros };
  }

  const possuiMaiuscula = /[A-Z]/.test(senha);
  if (!possuiMaiuscula) {
    erros.push(`A senha precisa conter pelo menos uma letra maiúscula.`);
    return { valida: false, erros };
  }

  const possuiMinuscula = /[a-z]/.test(senha);
  if (!possuiMinuscula) {
    erros.push(`A senha precisa conter pelo menos uma letra minúscula.`);
    return { valida: false, erros };
  }

  const possuiNumero = /[0-9]/.test(senha);
  if (!possuiNumero) {
    erros.push(`A senha precisa conter pelo menos um número.`);
    return { valida: false, erros };
  }

  const especiais = ['!', '@', '#', '*', '%', '$'];
  if (!especiais.some((char) => senha.includes(char))) {
    erros.push('A senha precisa conter pelo menos um caractere especial.');
    return { valida: false, erros };
  }

  return { valida: true, erros: [] };
}

//validar email
export function validacaoEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valido = regex.test(email);

  if (!valido) {
    return { valido: false, email };
  }
  return { valido: true, email };
}

//classificar semana
export const diasDaSemana = {
  Domingo: 0,
  Segunda: 1,
  Terca: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sabado: 6,
};

// Função para obter o número do dia
export function obterNumeroDia(nomeDia) {
  const numero = diasDaSemana[nomeDia];
  if (numero !== undefined) {
    return { sucesso: true, numero };
  }
  return { sucesso: false, erro: 'Dia da semana inválido' };
}

//data biblioteca  INSTALA: npm install date-fns
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatarData(dataString) {
  try {
    const data = parse(dataString, 'dd/MM/yyyy', new Date());

    if (isNaN(data.getTime())) {
      return {
        sucesso: false,
        erro: 'Data inválida',
        dataOriginal: dataString,
      };
    }

    const dataFormatada = format(data, 'dd MMMM yyyy', { locale: ptBR });
    return {
      sucesso: true,
      dataFormatada,
      dataOriginal: dataString,
    };
  } catch (error) {
    return {
      sucesso: false,
      erro: error.message,
      dataOriginal: dataString,
    };
  }
}

// horario biblioteca    INSTALA: npm install dayjs
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

export function formatarHora(horaString) {
  try {
    const hora = dayjs(horaString, 'HH:mm', true); // strict parsing

    if (!hora.isValid()) {
      return {
        sucesso: false,
        erro: 'Horário inválido',
        horaOriginal: horaString,
      };
    }

    const horaFormatada = hora.format('HH:mm');
    return {
      sucesso: true,
      horaFormatada,
      horaOriginal: horaString,
    };
  } catch (error) {
    return {
      sucesso: false,
      erro: error.message,
      horaOriginal: horaString,
    };
  }
}

// Função para validar múltiplos emails de uma vez
export function validarEmails(emails) {
  return emails.map((email) => validacaoEmail(email));
}

/**
 * Cores padrão para as especialidades do sistema
 * Usado em: Calendar, GerenciamentoProfessor, Studio, etc.
 */
export const especialidadeCores = {
  Pilates: '#ff6600',
  Fisioterapia: '#4CAF50',
  Osteopatia: '#2196F3',
  RPG: '#009688',
  Microfisioterapia: '#9C27B0',
  Shiatsu: '#673AB7',
  'Drenagem Linfática': '#03A9F4',
  Acupuntura: '#E91E63',
};

/**
 * Retorna a cor de fundo e texto para uma especialidade
 * @param {string} especialidade - Nome da especialidade
 * @returns {Object} { backgroundColor, textColor }
 */
export const getColorForEspecialidade = (especialidade) => {
  const backgroundColor = especialidadeCores[especialidade] || '#3788d8';
  const coresComTextoClaro = [
    '#ff6600',
    '#4CAF50',
    '#2196F3',
    '#9C27B0',
    '#673AB7',
    '#E91E63',
    '#009688',
    '#03A9F4',
  ];
  const textColor = coresComTextoClaro.includes(backgroundColor) ? '#fff' : '#000';
  return { backgroundColor, textColor };
};
