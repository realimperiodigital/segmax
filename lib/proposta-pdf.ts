import jsPDF from "jspdf";

type PropostaPdfData = {
  numero_proposta?: string | null;
  titulo_documento?: string | null;
  subtitulo_documento?: string | null;
  status?: string | null;

  cliente_nome?: string | null;
  cliente_email?: string | null;
  cliente_telefone?: string | null;
  cliente_empresa?: string | null;

  corretora_nome?: string | null;
  corretora_responsavel?: string | null;
  corretora_email?: string | null;
  corretora_telefone?: string | null;

  seguradora_nome?: string | null;
  ramo_seguro?: string | null;
  objeto_segurado?: string | null;
  importancia_segurada?: string | number | null;

  observacoes_cliente?: string | null;
  motivo_recusa?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

function linha(doc: jsPDF, y: number) {
  doc.setDrawColor(210, 210, 210);
  doc.line(15, y, 195, y);
}

function texto(doc: jsPDF, label: string, value: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.text(label, x, y);

  doc.setFont("helvetica", "normal");
  doc.text(value || "—", x, y + 6);
}

function formatarData(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatarMoeda(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "—";

  const numero =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d,.-]/g, "").replace(",", "."));

  if (Number.isNaN(numero)) return String(value);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

export function gerarPdfProposta(data: PropostaPdfData) {
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFillColor(7, 17, 31);
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SEGMAX CONSULTORIA", 15, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Proposta Executiva de Seguro", 15, 23);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);

  let y = 42;

  texto(doc, "Número da proposta", data.numero_proposta || "—", 15, y);
  texto(doc, "Status", data.status || "—", 110, y);

  y += 18;
  linha(doc, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Documento", 15, y);

  y += 10;
  texto(doc, "Título", data.titulo_documento || "Proposta Executiva", 15, y);
  y += 18;
  texto(doc, "Subtítulo", data.subtitulo_documento || "—", 15, y);

  y += 18;
  linha(doc, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Cliente", 15, y);

  y += 10;
  texto(doc, "Nome", data.cliente_nome || "—", 15, y);
  texto(doc, "Empresa", data.cliente_empresa || "—", 110, y);

  y += 18;
  texto(doc, "E-mail", data.cliente_email || "—", 15, y);
  texto(doc, "Telefone", data.cliente_telefone || "—", 110, y);

  y += 18;
  linha(doc, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Corretora", 15, y);

  y += 10;
  texto(doc, "Corretora", data.corretora_nome || "—", 15, y);
  texto(doc, "Responsável", data.corretora_responsavel || "—", 110, y);

  y += 18;
  texto(doc, "E-mail", data.corretora_email || "—", 15, y);
  texto(doc, "Telefone", data.corretora_telefone || "—", 110, y);

  y += 18;
  linha(doc, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Cobertura / Seguro", 15, y);

  y += 10;
  texto(doc, "Seguradora", data.seguradora_nome || "—", 15, y);
  texto(doc, "Ramo", data.ramo_seguro || "—", 110, y);

  y += 18;
  texto(doc, "Objeto segurado", data.objeto_segurado || "—", 15, y);
  texto(doc, "Importância segurada", formatarMoeda(data.importancia_segurada), 110, y);

  y += 22;
  linha(doc, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Observações", 15, y);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const observacoes = doc.splitTextToSize(
    data.observacoes_cliente || "Sem observações do cliente.",
    180
  );
  doc.text(observacoes, 15, y);

  y += Math.max(16, observacoes.length * 6 + 4);

  doc.setFont("helvetica", "bold");
  doc.text("Motivo de recusa", 15, y);

  y += 8;
  doc.setFont("helvetica", "normal");

  const recusa = doc.splitTextToSize(
    data.motivo_recusa || "Não informado.",
    180
  );
  doc.text(recusa, 15, y);

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Criado em: ${formatarData(data.created_at)}`, 15, 285);
  doc.text(`Atualizado em: ${formatarData(data.updated_at)}`, 15, 291);

  const nomeArquivo = `proposta-${data.numero_proposta || "segmax"}.pdf`;
  doc.save(nomeArquivo);
}