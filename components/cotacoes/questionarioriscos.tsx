'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase/client'

type QuestionnaireSlug = 'middle-risks' | 'grandes-riscos'

type QuestionnaireQuestion = {
  template_id: number
  template_slug: string
  template_title: string
  template_description: string | null
  question_id: number
  section: string
  question_order: number
  code: string
  question_text: string
  field_type: string
  required: boolean
  requires_acknowledgement: boolean
  placeholder: string | null
  help_text: string | null
  options_json: unknown
  conditional_parent_code: string | null
  conditional_operator: string | null
  conditional_value_json: unknown
}

type QuestionnaireAnswer = {
  question_id: number
  question_code: string
  answer_text: string
  answer_json: string[]
  acknowledged: boolean
}

type Props = {
  initialSlug?: QuestionnaireSlug
}

function parseStringArray(value: unknown): string[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.map((item) => String(item))
  }

  try {
    const parsed = JSON.parse(String(value))
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item))
    }
    return []
  } catch {
    return []
  }
}

export default function QuestionarioRiscos({
  initialSlug = 'middle-risks',
}: Props) {
  const [questionnaireSlug, setQuestionnaireSlug] =
    useState<QuestionnaireSlug>(initialSlug)

  const [questionnaireLoading, setQuestionnaireLoading] = useState(false)
  const [questionnaireError, setQuestionnaireError] = useState('')
  const [questionnaireTitle, setQuestionnaireTitle] = useState('')
  const [questionnaireDescription, setQuestionnaireDescription] = useState('')
  const [questionnaireQuestions, setQuestionnaireQuestions] = useState<QuestionnaireQuestion[]>([])
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, QuestionnaireAnswer>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const carregarQuestionario = useCallback(async (slug: QuestionnaireSlug) => {
    setQuestionnaireLoading(true)
    setQuestionnaireError('')
    setValidationErrors([])
    setQuestionnaireAnswers({})

    try {
      const { data, error } = await supabase.rpc('get_questionnaire_by_slug', {
        p_slug: slug,
      })

      if (error) {
        throw error
      }

      const perguntas = (data || []) as QuestionnaireQuestion[]

      setQuestionnaireQuestions(perguntas)
      setQuestionnaireTitle(perguntas[0]?.template_title || '')
      setQuestionnaireDescription(perguntas[0]?.template_description || '')
    } catch (err: any) {
      console.error('Erro ao carregar questionário:', err)
      setQuestionnaireError(err?.message || 'Erro ao carregar questionário')
      setQuestionnaireQuestions([])
      setQuestionnaireTitle('')
      setQuestionnaireDescription('')
    } finally {
      setQuestionnaireLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarQuestionario(questionnaireSlug)
  }, [carregarQuestionario, questionnaireSlug])

  function atualizarRespostaTexto(question: QuestionnaireQuestion, value: string) {
    setQuestionnaireAnswers((prev) => ({
      ...prev,
      [question.code]: {
        question_id: question.question_id,
        question_code: question.code,
        answer_text: value,
        answer_json: prev[question.code]?.answer_json || [],
        acknowledged: prev[question.code]?.acknowledged || false,
      },
    }))
  }

  function atualizarRespostaRadio(question: QuestionnaireQuestion, value: string) {
    setQuestionnaireAnswers((prev) => ({
      ...prev,
      [question.code]: {
        question_id: question.question_id,
        question_code: question.code,
        answer_text: value,
        answer_json: [value],
        acknowledged: prev[question.code]?.acknowledged || false,
      },
    }))
  }

  function atualizarRespostaCheckbox(
    question: QuestionnaireQuestion,
    option: string,
    checked: boolean
  ) {
    setQuestionnaireAnswers((prev) => {
      const atual = prev[question.code]?.answer_json || []

      const novoArray = checked
        ? [...atual, option].filter((item, index, arr) => arr.indexOf(item) === index)
        : atual.filter((item) => item !== option)

      return {
        ...prev,
        [question.code]: {
          question_id: question.question_id,
          question_code: question.code,
          answer_text: '',
          answer_json: novoArray,
          acknowledged: prev[question.code]?.acknowledged || false,
        },
      }
    })
  }

  function atualizarCiencia(question: QuestionnaireQuestion, checked: boolean) {
    setQuestionnaireAnswers((prev) => ({
      ...prev,
      [question.code]: {
        question_id: question.question_id,
        question_code: question.code,
        answer_text: prev[question.code]?.answer_text || '',
        answer_json: prev[question.code]?.answer_json || [],
        acknowledged: checked,
      },
    }))
  }

  function perguntaVisivel(question: QuestionnaireQuestion) {
    if (!question.conditional_parent_code) return true

    const parentAnswer = questionnaireAnswers[question.conditional_parent_code]

    if (!parentAnswer) return false

    const operador = question.conditional_operator
    const valores = parseStringArray(question.conditional_value_json)

    if (operador === 'equals') {
      return valores.includes(parentAnswer.answer_text)
    }

    if (operador === 'contains') {
      return valores.some((valor) => parentAnswer.answer_json.includes(valor))
    }

    return true
  }

  const questionarioPorSecao = useMemo(() => {
    return questionnaireQuestions.reduce<Record<string, QuestionnaireQuestion[]>>((acc, pergunta) => {
      if (!perguntaVisivel(pergunta)) return acc

      if (!acc[pergunta.section]) {
        acc[pergunta.section] = []
      }

      acc[pergunta.section].push(pergunta)
      return acc
    }, {})
  }, [questionnaireQuestions, questionnaireAnswers])

  function validarQuestionario() {
    const erros: string[] = []

    for (const question of questionnaireQuestions) {
      if (!perguntaVisivel(question)) continue

      const resposta = questionnaireAnswers[question.code]

      if (question.required) {
        const campoVazio =
          !resposta ||
          (!resposta.answer_text?.trim() &&
            (!resposta.answer_json || resposta.answer_json.length === 0))

        if (campoVazio) {
          erros.push(`Preencha: ${question.question_text}`)
        }
      }

      if (question.requires_acknowledgement) {
        if (!resposta?.acknowledged) {
          erros.push(`Marque a ciência da resposta: ${question.question_text}`)
        }
      }
    }

    return erros
  }

  function handleValidar() {
    const erros = validarQuestionario()
    setValidationErrors(erros)

    if (erros.length === 0) {
      alert('Questionário validado com sucesso.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setQuestionnaireSlug('middle-risks')}
            className={`rounded-xl px-4 py-2 text-sm font-medium border transition ${
              questionnaireSlug === 'middle-risks'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-zinc-300'
            }`}
          >
            Middle / Compreensivo
          </button>

          <button
            type="button"
            onClick={() => setQuestionnaireSlug('grandes-riscos')}
            className={`rounded-xl px-4 py-2 text-sm font-medium border transition ${
              questionnaireSlug === 'grandes-riscos'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-zinc-300'
            }`}
          >
            Grandes Riscos
          </button>
        </div>
      </div>

      {questionnaireLoading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 shadow-sm">
          Carregando questionário...
        </div>
      )}

      {!!questionnaireError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
          {questionnaireError}
        </div>
      )}

      {!questionnaireLoading && !questionnaireError && (
        <>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900">
              {questionnaireTitle}
            </h3>

            {!!questionnaireDescription && (
              <p className="mt-2 text-sm text-zinc-600">
                {questionnaireDescription}
              </p>
            )}
          </div>

          {validationErrors.length > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-amber-800">
                Pendências do questionário
              </h4>

              <div className="mt-3 space-y-2">
                {validationErrors.map((erro, index) => (
                  <p key={`${erro}-${index}`} className="text-sm text-amber-900">
                    {erro}
                  </p>
                ))}
              </div>
            </div>
          )}

          {Object.entries(questionarioPorSecao).map(([secao, perguntas]) => (
            <div
              key={secao}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-5"
            >
              <h4 className="text-base font-semibold text-zinc-900">
                {secao}
              </h4>

              {perguntas.map((question) => {
                const resposta = questionnaireAnswers[question.code]
                const opcoes = parseStringArray(question.options_json)

                return (
                  <div
                    key={question.question_id}
                    className="space-y-3 rounded-2xl border border-zinc-200 p-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-zinc-900">
                        {question.question_text}
                      </label>

                      {!!question.help_text && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {question.help_text}
                        </p>
                      )}
                    </div>

                    {(question.field_type === 'text' ||
                      question.field_type === 'date' ||
                      question.field_type === 'number') && (
                      <input
                        type={
                          question.field_type === 'date'
                            ? 'date'
                            : question.field_type === 'number'
                            ? 'number'
                            : 'text'
                        }
                        value={resposta?.answer_text || ''}
                        placeholder={question.placeholder || ''}
                        onChange={(e) => atualizarRespostaTexto(question, e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
                      />
                    )}

                    {question.field_type === 'textarea' && (
                      <textarea
                        value={resposta?.answer_text || ''}
                        placeholder={question.placeholder || ''}
                        onChange={(e) => atualizarRespostaTexto(question, e.target.value)}
                        className="min-h-[120px] w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
                      />
                    )}

                    {question.field_type === 'radio' && (
                      <div className="flex flex-col gap-2">
                        {opcoes.map((opcao) => (
                          <label
                            key={opcao}
                            className="flex items-center gap-2 text-sm text-zinc-700"
                          >
                            <input
                              type="radio"
                              name={question.code}
                              checked={resposta?.answer_text === opcao}
                              onChange={() => atualizarRespostaRadio(question, opcao)}
                            />
                            <span>{opcao}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.field_type === 'checkbox' && (
                      <div className="flex flex-col gap-2">
                        {opcoes.map((opcao) => (
                          <label
                            key={opcao}
                            className="flex items-center gap-2 text-sm text-zinc-700"
                          >
                            <input
                              type="checkbox"
                              checked={resposta?.answer_json?.includes(opcao) || false}
                              onChange={(e) =>
                                atualizarRespostaCheckbox(question, opcao, e.target.checked)
                              }
                            />
                            <span>{opcao}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.field_type === 'checkbox_single' && (
                      <label className="flex items-center gap-2 text-sm text-zinc-700">
                        <input
                          type="checkbox"
                          checked={
                            resposta?.answer_json?.includes('Estou ciente e de acordo') || false
                          }
                          onChange={(e) =>
                            atualizarRespostaCheckbox(
                              question,
                              'Estou ciente e de acordo',
                              e.target.checked
                            )
                          }
                        />
                        <span>Estou ciente e de acordo</span>
                      </label>
                    )}

                    {question.requires_acknowledgement && (
                      <label className="flex items-center gap-2 text-sm text-zinc-700">
                        <input
                          type="checkbox"
                          checked={resposta?.acknowledged || false}
                          onChange={(e) => atualizarCiencia(question, e.target.checked)}
                        />
                        <span>Declaro ciência e responsabilidade sobre esta resposta.</span>
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={handleValidar}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Validar questionário
            </button>
          </div>
        </>
      )}
    </div>
  )
}