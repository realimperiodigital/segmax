type Props = {
  params: {
    id: string
  }
}

export default function AnaliseTecnicaDetalhePage({ params }: Props) {
  return (
    <main>
      <h1>Análise Técnica</h1>

      <p>ID da análise: {params.id}</p>
    </main>
  )
}