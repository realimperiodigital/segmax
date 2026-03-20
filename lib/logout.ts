export function limparSessaoSegmax() {
  // LIMPAR COOKIES
  document.cookie =
    "segmax_permissao=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  document.cookie =
    "segmax_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  document.cookie =
    "segmax_nome=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

  // LIMPAR LOCAL STORAGE
  localStorage.removeItem("segmax_permissao")
  localStorage.removeItem("segmax_role")
  localStorage.removeItem("segmax_nome")
}