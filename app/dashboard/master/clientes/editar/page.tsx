type Cliente = {
  id: string
  nome: string
}

export default function EditarClientePage() {
  const clientes: Cliente[] = [
    {
      id: "1",
      nome: "Cliente Teste"
    }
  ]

  return (
    <main>
      <h1>Editar Cliente</h1>

      {clientes.map((cliente) => (
        <div key={cliente.id}>
          <a href={`/dashboard/master/clientes/${cliente.id}/editar`}>
            Editar {cliente.nome}
          </a>
        </div>
      ))}
    </main>
  )
}