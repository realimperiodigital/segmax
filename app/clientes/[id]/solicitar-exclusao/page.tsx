"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import SegmaxShell from "@/components/segmaxshell";
import { Trash2, ArrowLeft } from "lucide-react";

export default function SolicitarExclusaoClientePage() {
  const params = useParams();
  const router = useRouter();

  const clienteId = params?.id as string;

  async function solicitarExclusao() {
    try {
      const response = await fetch(
        `/api/clientes/${clienteId}/solicitar-exclusao`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao solicitar exclusão");
      }

      alert("Solicitação enviada com sucesso.");
      router.push("/clientes");
    } catch (error) {
      console.error(error);
      alert("Erro ao solicitar exclusão.");
    }
  }

  return (
    <SegmaxShell role="master">
      <div className="max-w-2xl mx-auto mt-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-semibold text-white">
              Solicitar exclusão de cliente
            </h1>
          </div>

          <p className="text-sm text-gray-400 mb-8">
            Esta ação enviará uma solicitação para exclusão deste cliente.
            A exclusão só será realizada após aprovação do responsável.
          </p>

          <button
            onClick={solicitarExclusao}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Solicitar exclusão
          </button>
        </div>
      </div>
    </SegmaxShell>
  );
}