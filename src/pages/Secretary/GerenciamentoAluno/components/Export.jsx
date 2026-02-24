import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const abrirModalDownload = async (students, calculateAge) => {
  const result = await Swal.fire({
    title: 'Exportar Relatório de Alunos',
    html: `
      <div style="text-align: left; padding: 10px;">
        <p style="margin-bottom: 15px; color: #666;">
          Selecione o formato desejado para exportar a lista de alunos:
        </p>
        <p style="font-size: 14px; color: #999;">
          Total de registros: <strong>${students.length}</strong>
        </p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    showDenyButton: true,
    denyButtonColor: '#1D6F42',
    confirmButtonText: 'Baixar PDF',
    denyButtonText: 'Baixar XLSX',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      gerarPDF(students, calculateAge);
      Swal.fire({
        title: 'Sucesso!',
        text: 'PDF gerado com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Swal.fire({
        title: 'Erro!',
        text: 'Falha ao gerar PDF.',
        icon: 'error',
      });
    }
  } else if (result.isDenied) {
    try {
      gerarXLSX(students, calculateAge);
      Swal.fire({
        title: 'Sucesso!',
        text: 'Excel gerado com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Erro ao gerar XLSX:', error);
      Swal.fire({
        title: 'Erro!',
        text: 'Falha ao gerar XLSX.',
        icon: 'error',
      });
    }
  }
};

function gerarPDF(students, calculateAge) {
  if (!Array.isArray(students)) students = [];

  const logoUrl = '/logoMinimalistaPreta.png';
  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
    const doc = new jsPDF();

    // Logo proporcional (menos esticada)
    doc.addImage(img, 'PNG', 160, 10, 30, 15);

    // Título principal
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.setFont(undefined, 'bold');
    doc.text('Alunos Cadastrados - One Pilates', 14, 18);

    // Subtítulo
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Relatório de Alunos Cadastrados', 14, 26);

    // Linha separadora
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(14, 30, 196, 30);

    // Informações do relatório
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(`Gerado em: ${dataAtual}`, 14, 38);
    doc.text(`Total de alunos: ${students.length}`, 14, 44);

    const tableData = students.map((aluno) => [
      aluno.nome || '',
      aluno.email || '',
      aluno.cpf || '',
      String(calculateAge ? calculateAge(aluno.dataNascimento) : ''),
      aluno.status ? 'Ativo' : 'Inativo',
      aluno.alunoComLimitacoesFisicas ? 'Sim' : 'Não',
    ]);

    try {
      doc.autoTable({
        startY: 52,
        head: [['Nome Completo', 'Email', 'CPF', 'Idade', 'Status', 'Limitações Físicas']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center',
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: 50,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { cellWidth: 45, halign: 'left' },
          1: { cellWidth: 50, halign: 'left' },
          2: { cellWidth: 28, halign: 'center' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 25, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
        styles: {
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
      });
    } catch (err) {
      console.error('autoTable erro:', err);
      let y = 52;
      doc.setFontSize(9);
      tableData.forEach((row) => {
        doc.text(row.join('  |  '), 14, y);
        y += 6;
        if (y > doc.internal.pageSize.height - 20) {
          doc.addPage();
          y = 20;
        }
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' },
      );
      doc.text(
        '© 2025 One Pilates - Todos os direitos reservados',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 6,
        { align: 'center' },
      );
    }

    const nomeArquivo = 'Relatorio_dos_Alunos.pdf';
    doc.save(nomeArquivo);
  };
}

function gerarXLSX(students, calculateAge) {
  const worksheetData = students.map((aluno, index) => ({
    '#': index + 1,
    'Nome Completo': aluno.nome,
    Email: aluno.email,
    CPF: aluno.cpf,
    'Data de Nascimento': aluno.dataNascimento,
    Idade: calculateAge ? calculateAge(aluno.dataNascimento) : '',
    Status: aluno.status ? 'Ativo' : 'Inativo',
    'Possui Limitações Físicas': aluno.alunoComLimitacoesFisicas ? 'Sim' : 'Não',
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 30 },
    { wch: 15 },
    { wch: 18 },
    { wch: 8 },
    { wch: 12 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos');

  const infoData = [
    { Campo: 'Sistema', Valor: 'Sistema de Gestão Escolar' },
    { Campo: 'Relatório', Valor: 'Lista de Alunos Cadastrados' },
    { Campo: 'Data de Geração', Valor: new Date().toLocaleString('pt-BR') },
    { Campo: 'Total de Registros', Valor: students.length },
    { Campo: 'Alunos Ativos', Valor: students.filter((a) => a.status).length },
    { Campo: 'Alunos Inativos', Valor: students.filter((a) => !a.status).length },
    {
      Campo: 'Com Limitações Físicas',
      Valor: students.filter((a) => a.alunoComLimitacoesFisicas).length,
    },
  ];

  const infoWorksheet = XLSX.utils.json_to_sheet(infoData);
  infoWorksheet['!cols'] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, infoWorksheet, 'Informações');

  const nomeArquivo = 'Relatorio_dos_Alunos.xlsx';
  XLSX.writeFile(workbook, nomeArquivo);
}
