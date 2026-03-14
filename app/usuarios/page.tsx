"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Usuario = {

id: string
nome: string | null
email: string | null
telefone: string | null
role: string | null
status: string | null

}

export default function UsuariosPage() {

const [usuarios,setUsuarios] = useState<Usuario[]>([])
const [loading,setLoading] = useState(true)

async function carregarUsuarios(){

setLoading(true)

const {data,error} = await supabase
.from("usuarios")
.select("*")
.order("created_at",{ascending:false})

if(!error && data){

setUsuarios(data)

}

setLoading(false)

}

async function alterarStatus(id:string,status:string){

await supabase
.from("usuarios")
.update({status})
.eq("id",id)

carregarUsuarios()

}

async function excluir(id:string){

if(!confirm("Deseja excluir este usuário?")) return

await supabase
.from("usuarios")
.delete()
.eq("id",id)

carregarUsuarios()

}

useEffect(()=>{

carregarUsuarios()

},[])

return(

<main className="min-h-screen bg-[#0b0d12] p-10">

<div className="flex justify-between items-center mb-10">

<div>

<h1 className="text-4xl text-white font-bold">
Usuários
</h1>

<p className="text-gray-400 mt-2">
Gestão de usuários das corretoras
</p>

</div>

<Link
href="/usuarios/novo"
className="bg-[#d4a63a] px-6 py-3 rounded-xl font-bold text-black"
>

Novo Usuário

</Link>

</div>

{loading ?

<div className="text-gray-400">Carregando...</div>

:

<div className="grid gap-5">

{usuarios.map((u)=>(
<div
key={u.id}
className="bg-[#11141b] border border-[#2a2e37] p-6 rounded-2xl"
>

<div className="flex justify-between">

<div>

<h2 className="text-white font-bold text-lg">

{u.nome}

</h2>

<p className="text-gray-400 text-sm">

{u.email}

</p>

<p className="text-gray-500 text-sm mt-1">

Telefone: {u.telefone}

</p>

</div>

<div className="text-right">

<div className="text-gray-400 text-sm">

Perfil

</div>

<div className="text-white font-bold">

{u.role}

</div>

<div className="text-gray-400 text-sm mt-2">

Status

</div>

<div className="text-white font-bold">

{u.status}

</div>

</div>

</div>

<div className="flex gap-3 mt-6">

<Link
href={`/usuarios/novo?id=${u.id}`}
className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>

Editar

</Link>

<button
onClick={()=>alterarStatus(u.id,"suspenso")}
className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
>

Suspender

</button>

<button
onClick={()=>alterarStatus(u.id,"bloqueado")}
className="px-4 py-2 bg-red-600 text-white rounded-lg"
>

Bloquear

</button>

<button
onClick={()=>excluir(u.id)}
className="px-4 py-2 bg-gray-700 text-white rounded-lg"
>

Excluir

</button>

</div>

</div>

))}

</div>

}

</main>

)

}