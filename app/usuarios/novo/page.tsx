"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Corretora = {
  id: string
  nome_fantasia: string | null
}

export default function NovoUsuarioPage(){

const router = useRouter()
const searchParams = useSearchParams()

const usuarioId = searchParams.get("id")

const [corretoras,setCorretoras] = useState<Corretora[]>([])

const [nome,setNome] = useState("")
const [email,setEmail] = useState("")
const [telefone,setTelefone] = useState("")
const [role,setRole] = useState("corretor")
const [status,setStatus] = useState("ativo")
const [corretoraId,setCorretoraId] = useState("")

const [loading,setLoading] = useState(true)
const [salvando,setSalvando] = useState(false)
const [erro,setErro] = useState("")
const [mensagem,setMensagem] = useState("")

useEffect(()=>{

carregarCorretoras()

if(usuarioId){

carregarUsuario()

}else{

setLoading(false)

}

},[])

async function carregarCorretoras(){

const {data,error} = await supabase
.from("corretoras")
.select("id,nome_fantasia")
.order("nome_fantasia")

if(!error && data){

setCorretoras(data)

}

}

async function carregarUsuario(){

const {data,error} = await supabase
.from("usuarios")
.select("*")
.eq("id",usuarioId)
.single()

if(!error && data){

setNome(data.nome ?? "")
setEmail(data.email ?? "")
setTelefone(data.telefone ?? "")
setRole(data.role ?? "corretor")
setStatus(data.status ?? "ativo")
setCorretoraId(data.corretora_id ?? "")

}

setLoading(false)

}

async function salvar(e:FormEvent){

e.preventDefault()

setErro("")
setMensagem("")

if(!nome) return setErro("Informe o nome")
if(!email) return setErro("Informe o email")
if(!corretoraId) return setErro("Selecione a corretora")

try{

setSalvando(true)

if(usuarioId){

const {error} = await supabase
.from("usuarios")
.update({
nome,
email,
telefone,
role,
status,
corretora_id:corretoraId
})
.eq("id",usuarioId)

if(error) throw error

setMensagem("Usuário atualizado")

}else{

const {error} = await supabase
.from("usuarios")
.insert({
nome,
email,
telefone,
role,
status,
corretora_id:corretoraId
})

if(error) throw error

setMensagem("Usuário criado")

}

setTimeout(()=>{

router.push("/usuarios")

},1000)

}catch(e:any){

setErro(e.message)

}

setSalvando(false)

}

if(loading){

return(

<main className="min-h-screen bg-[#0b0d12] flex items-center justify-center text-gray-400">

Carregando...

</main>

)

}

return(

<main className="min-h-screen bg-[#0b0d12] p-10">

<div className="max-w-3xl mx-auto">

<h1 className="text-3xl text-white font-bold mb-6">

{usuarioId ? "Editar Usuário" : "Novo Usuário"}

</h1>

<form
onSubmit={salvar}
className="bg-[#11141b] border border-[#2a2e37] rounded-2xl p-8 space-y-5"
>

<div>

<label className="text-gray-400 text-sm">
Nome
</label>

<input
value={nome}
onChange={(e)=>setNome(e.target.value)}
className="w-full mt-2 p-3 rounded-xl bg-[#1b1f29] text-white"
/>

</div>

<div>

<label className="text-gray-400 text-sm">
Email
</label>

<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full mt-2 p-3 rounded-xl bg-[#1b1f29] text-white"
/>

</div>

<div>

<label className="text-gray-400 text-sm">
Telefone
</label>

<input
value={telefone}
onChange={(e)=>setTelefone(e.target.value)}
className="w-full mt-2 p-3 rounded-xl bg-[#1b1f29] text-white"
/>

</div>

<div>

<label className="text-gray-400 text-sm">
Corretora
</label>

<select
value={corretoraId}
onChange={(e)=>setCorretoraId(e.target.value)}
className="w-full mt-2 p-3 rounded-xl bg-[#1b1f29] text-white"
>

<option value="">Selecione</option>

{corretoras.map((c)=>(
<option key={c.id} value={c.id}>
{c.nome_fantasia}
</option>
))}

</select>

</div>

<div>

<label className="text-gray-400 text-sm">
Perfil
</label>

<select
value={role}
onChange={(e)=>setRole(e.target.value)}
className="w-full mt-2 p-3 rounded-xl bg-[#1b1f29] text-white"
>

<option value="admin_corretora">Admin Corretora</option>
<option value="corretor">Corretor</option>
<option value="financeiro">Financeiro</option>

</select>

</div>

<div>

<label className="text-gray-400 text-sm">
Status
</label>

<select
value={status}
onChange={(e)=>setStatus(e.target.value)}
className="w-full mt-2 p-3 rounded-xl bg-[#1b1f29] text-white"
>

<option value="ativo">Ativo</option>
<option value="suspenso">Suspenso</option>
<option value="bloqueado">Bloqueado</option>

</select>

</div>

{erro &&

<div className="text-red-400 text-sm">
{erro}
</div>

}

{mensagem &&

<div className="text-green-400 text-sm">
{mensagem}
</div>

}

<div className="flex gap-3 pt-4">

<Link
href="/usuarios"
className="px-5 py-3 rounded-xl bg-gray-700 text-white"
>

Cancelar

</Link>

<button
type="submit"
disabled={salvando}
className="px-6 py-3 rounded-xl bg-[#d4a63a] text-black font-bold"
>

{salvando ? "Salvando..." : "Salvar"}

</button>

</div>

</form>

</div>

</main>

)

}