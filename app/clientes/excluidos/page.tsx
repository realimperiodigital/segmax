"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  motivo_exclusao: string;
  data_exclusao: string;
};

export default function ClientesExcluidos() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  async function carregarClientes() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("excluido", true)
      .order("data_exclusao", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setClientes(data || []);
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  async function restaurar(id: string) {
    const confirmar = confirm("Deseja restaurar este cliente?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("clients")
      .update({
        excluido: false,
        status: "ativo",
        motivo_exclusao: null,
        data_exclusao: null
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    carregarClientes();
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 20 }}>Clientes Excluídos</h1>

      <table
        border={1}
        cellPadding={10}
        style={{
          borderCollapse: "collapse",
          width: "100%",
          maxWidth: 1000
        }}
      >
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Motivo</th>
            <th>Data Exclusão</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {clientes.length === 0 ? (
            <tr>
              <td colSpan={6}>Nenhum cliente excluído</td>
            </tr>
          ) : (
            clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.motivo_exclusao}</td>
                <td>
                  {cliente.data_exclusao
                    ? new Date(cliente.data_exclusao).toLocaleDateString()
                    : ""}
                </td>

                <td>
                  <button onClick={() => restaurar(cliente.id)}>
                    Restaurar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}