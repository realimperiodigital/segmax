"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ClientesPage() {

  const [clientes,setClientes] = useState<any[]>([]);
  const [busca,setBusca] = useState("");

  useEffect(()=>{
    carregarClientes()
  },[])

  async function carregarClientes(){

    const {data,error} = await supabase
      .from("clientes")
      .select("*")
      .eq("excluido",false)
      .order("nome")

    if(error){
      console.log(error)
      return
    }

    setClientes(data || [])
  }

  const clientesFiltrados = clientes.filter((c)=>
    c.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  return(

    <div className="p-10">

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-3xl font-semibold text-white">
            Clientes
          </h1>

          <p className="text-zinc-400">
            Gestão completa de clientes segurados
          </p>

        </div>

        <Link
          href="/clientes/novo"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-xl transition"
        >
          Novo Cliente
        </Link>

      </div>

      <div className="mb-8">

        <input
          placeholder="Buscar cliente..."
          value={busca}
          onChange={(e)=>setBusca(e.target.value)}
          className="w-full bg-[#111] border border-zinc-700 rounded-xl px-5 py-3 text-white"
        />

      </div>

      <div className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-black text-zinc-400">

            <tr>

              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Tipo</th>
              <th className="text-left p-4">CPF / CNPJ</th>
              <th className="text-left p-4">Cidade</th>
              <th className="text-left p-4">Telefone</th>
              <th className="text-right p-4">Ações</th>

            </tr>

          </thead>

          <tbody>

            {clientesFiltrados.map((cliente)=>(
              <tr
                key={cliente.id}
                className="border-t border-zinc-800 hover:bg-[#111]"
              >

                <td className="p-4 text-white">
                  {cliente.nome}
                </td>

                <td className="p-4 text-zinc-400">
                  {cliente.tipo_pessoa === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}
                </td>

                <td className="p-4 text-zinc-400">
                  {cliente.cpf_cnpj}
                </td>

                <td className="p-4 text-zinc-400">
                  {cliente.cidade}
                </td>

                <td className="p-4 text-zinc-400">
                  {cliente.telefone}
                </td>

                <td className="p-4 flex justify-end gap-3">

                  <Link
                    href={`/clientes/${cliente.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Ver
                  </Link>

                  <Link
                    href={`/clientes/${cliente.id}/editar`}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    Editar
                  </Link>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}