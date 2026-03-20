import { getUserAccess } from "@/lib/get-user-access";
import { redirect } from "next/navigation";

export default async function PropostaExecutivaPage() {
  const access = await getUserAccess();

  if (!access) {
    redirect("/login");
  }

  // ⚠️ MOCK TEMPORÁRIO (depois vamos puxar do banco)
  const corretora = {
    nome: "SegMax Consultoria",
    telefone: "(11) 99999-9999",
    email: "contato@segmax.com",
  };

  const cliente = {
    nome: "Empresa XYZ Ltda",
    documento: "12.345.678/0001-90",
    atividade: "Comércio Varejista",
    endereco: "São Paulo - SP",
  };

  const opcoes = [
    {
      seguradora: "Porto Seguro",
      cobertura: "R$ 1.000.000",
      franquia: "R$ 5.000",
      premio: "R$ 8.500/ano",
      observacao: "Melhor custo-benefício",
    },
    {
      seguradora: "Tokio Marine",
      cobertura: "R$ 1.200.000",
      franquia: "R$ 7.000",
      premio: "R$ 9.800/ano",
      observacao: "Cobertura mais ampla",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-black px-10 py-12">
      <div className="max-w-4xl mx-auto">

        {/* CAPA */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold">Proposta Executiva</h1>
          <p className="mt-2 text-gray-600">
            {cliente.nome}
          </p>
        </div>

        {/* APRESENTAÇÃO */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Apresentação</h2>
          <p className="text-gray-700 leading-relaxed">
            Apresentamos a seguir a proposta estruturada para análise e contratação do seguro,
            elaborada com base nas informações fornecidas e no perfil de risco identificado.
            O objetivo deste material é oferecer clareza, segurança na tomada de decisão e
            visão comparativa das opções disponíveis.
          </p>
        </section>

        {/* DADOS DO CLIENTE */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Dados do Cliente</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><strong>Nome:</strong> {cliente.nome}</p>
            <p><strong>Documento:</strong> {cliente.documento}</p>
            <p><strong>Atividade:</strong> {cliente.atividade}</p>
            <p><strong>Endereço:</strong> {cliente.endereco}</p>
          </div>
        </section>

        {/* DIAGNÓSTICO */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Diagnóstico Técnico</h2>
          <p className="text-gray-700">
            Com base nas informações analisadas, identificamos exposição relevante a riscos
            patrimoniais, especialmente relacionados a incêndio, danos elétricos e responsabilidade civil.
            Recomenda-se estruturação de cobertura adequada com foco na continuidade operacional.
          </p>
        </section>

        {/* COMPARATIVO */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Comparativo de Seguradoras</h2>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Seguradora</th>
                  <th className="p-3">Cobertura</th>
                  <th className="p-3">Franquia</th>
                  <th className="p-3">Prêmio</th>
                  <th className="p-3">Observação</th>
                </tr>
              </thead>
              <tbody>
                {opcoes.map((op, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{op.seguradora}</td>
                    <td className="p-3">{op.cobertura}</td>
                    <td className="p-3">{op.franquia}</td>
                    <td className="p-3">{op.premio}</td>
                    <td className="p-3">{op.observacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RECOMENDAÇÃO */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Recomendação Técnica</h2>
          <p className="text-gray-700">
            Após análise comparativa das opções disponíveis, entendemos que a alternativa
            apresentada pela seguradora Porto Seguro oferece o melhor equilíbrio entre cobertura,
            custo e aderência ao perfil de risco analisado.
          </p>
        </section>

        {/* RODAPÉ */}
        <section className="mt-16 border-t pt-6 text-sm text-gray-600">
          <p className="font-semibold">{corretora.nome}</p>
          <p>{corretora.telefone}</p>
          <p>{corretora.email}</p>
        </section>

      </div>
    </main>
  );
}