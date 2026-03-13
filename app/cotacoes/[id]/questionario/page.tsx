"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type QuoteTableName = "cotacoes" | "quotes";

type QuoteBase = {
  id: string | number;
  risk_type: string | null;
  questionnaire_template_code: string | null;
  isic_code: string | null;
};

type TemplateRow = {
  id: number;
  slug: string;
  title: string;
};

type QuestionRow = {
  id: number;
  section: string | null;
  question_order: number;
  code: string;
  question_text: string;
  field_type: string;
  required: boolean;
  requires_acknowledgement: boolean | null;
  options_json: any;
  conditional_parent_code: string | null;
  conditional_operator: string | null;
  conditional_value_json: any;

  // opcionais para evitar erro de tipagem
  template_id?: number | null;
  placeholder?: string | null;
  help_text?: string | null;
};

type AnswerRecord = {
  question_id: number;
  answer_text: string | null;
  answer_boolean: boolean | null;
  answer_number: number | null;
  answer_json: any;
};

type AnswerMap = Record<string, any>;
type ErrorMap = Record<string, string>;

function normalizeOptions(options: any): Array<{ label: string; value: string }> {
  if (!options) return [];

  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  }

  if (Array.isArray(options)) return options;

  return [];
}

function isEmptyValue(value: any) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function formatFieldType(fieldType: string) {
  const t = (fieldType || "").toLowerCase();

  if (t === "textarea") return "textarea";
  if (t === "number") return "number";
  if (t === "select") return "select";
  if (t === "multiselect") return "multiselect";
  if (t === "boolean") return "boolean";

  return "text";
}

function evaluateConditional(question: QuestionRow, answersByCode: AnswerMap) {
  if (!question.conditional_parent_code) return true;

  const parentValue = answersByCode[question.conditional_parent_code];
  const operator = (question.conditional_operator || "=").trim();
  const target = question.conditional_value_json;

  if (operator === "=" || operator === "==") {
    if (Array.isArray(target)) {
      return target.includes(parentValue);
    }
    return parentValue === target;
  }

  if (operator === "!=") {
    if (Array.isArray(target)) {
      return !target.includes(parentValue);
    }
    return parentValue !== target;
  }

  if (operator.toLowerCase() === "in") {
    if (Array.isArray(target)) {
      return target.includes(parentValue);
    }
    return false;
  }

  if (operator.toLowerCase() === "not in") {
    if (Array.isArray(target)) {
      return !target.includes(parentValue);
    }
    return true;
  }

  return true;
}

export default function CotacaoQuestionarioPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quoteTable, setQuoteTable] = useState<QuoteTableName | null>(null);
  const [template, setTemplate] = useState<TemplateRow | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [errors, setErrors] = useState<ErrorMap>({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const answersByCode = useMemo(() => {
    const map: AnswerMap = {};

    for (const question of questions) {
      map[question.code] = answers[String(question.id)];
    }

    return map;
  }, [questions, answers]);

  const visibleQuestions = useMemo(() => {
    return questions.filter((q) => evaluateConditional(q, answersByCode));
  }, [questions, answersByCode]);

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, QuestionRow[]> = {};

    for (const question of visibleQuestions) {
      const section = question.section || "Geral";

      if (!groups[section]) {
        groups[section] = [];
      }

      groups[section].push(question);
    }

    return groups;
  }, [visibleQuestions]);

  const setAnswerValue = useCallback((questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: value,
    }));

    setErrors((prev) => {
      const next = { ...prev };
      delete next[String(questionId)];
      return next;
    });
  }, []);

  const fetchQuote = useCallback(async (): Promise<{ table: QuoteTableName; data: QuoteBase } | null> => {
    if (!quoteId) return null;

    const tryCotacoes = await supabase
      .from("cotacoes")
      .select("id, risk_type, questionnaire_template_code, isic_code")
      .eq("id", quoteId)
      .maybeSingle();

    if (!tryCotacoes.error && tryCotacoes.data) {
      return { table: "cotacoes", data: tryCotacoes.data as QuoteBase };
    }

    const tryQuotes = await supabase
      .from("quotes")
      .select("id, risk_type, questionnaire_template_code, isic_code")
      .eq("id", quoteId)
      .maybeSingle();

    if (!tryQuotes.error && tryQuotes.data) {
      return { table: "quotes", data: tryQuotes.data as QuoteBase };
    }

    return null;
  }, [quoteId]);

  const fetchTemplateIdBySlug = useCallback(async (slug: string) => {
    const { data, error } = await supabase
      .from("questionnaire_templates")
      .select("id, slug, title")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return data as TemplateRow;
  }, []);

  const fetchTemplateByRisk = useCallback(async (riskType: string) => {
    const { data, error } = await supabase.rpc("get_template_by_risk", {
      p_risk_type: riskType,
    });

    if (error) throw error;
    if (!data) return null;

    const templateId = Number(data);
    if (!templateId) return null;

    const { data: templateData, error: templateError } = await supabase
      .from("questionnaire_templates")
      .select("id, slug, title")
      .eq("id", templateId)
      .maybeSingle();

    if (templateError) throw templateError;
    if (!templateData) return null;

    return templateData as TemplateRow;
  }, []);

  const fetchQuestionsByTemplate = useCallback(async (templateId: number) => {
    const { data, error } = await supabase.rpc("get_questionnaire_by_template", {
      p_template_id: templateId,
    });

    if (error) throw error;

    return (data || []) as QuestionRow[];
  }, []);

  const fetchSavedAnswers = useCallback(async () => {
    if (!quoteId) return {};

    const { data, error } = await supabase
      .from("quote_questionnaire_answers")
      .select("question_id, answer_text, answer_boolean, answer_number, answer_json")
      .eq("quotation_id", quoteId);

    if (error) throw error;

    const map: AnswerMap = {};

    for (const row of (data || []) as AnswerRecord[]) {
      if (row.answer_json !== null && row.answer_json !== undefined) {
        map[String(row.question_id)] = row.answer_json;
      } else if (row.answer_number !== null && row.answer_number !== undefined) {
        map[String(row.question_id)] = row.answer_number;
      } else if (row.answer_boolean !== null && row.answer_boolean !== undefined) {
        map[String(row.question_id)] = row.answer_boolean;
      } else {
        map[String(row.question_id)] = row.answer_text ?? "";
      }
    }

    return map;
  }, [quoteId]);

  const ensureQuoteTemplateLinked = useCallback(
    async (table: QuoteTableName, templateRow: TemplateRow, currentRiskType: string | null) => {
      if (!quoteId) return;

      const updatePayload: Record<string, any> = {
        questionnaire_template_code: templateRow.slug,
      };

      if (currentRiskType) {
        updatePayload.risk_type = currentRiskType;
      }

      await supabase.from(table).update(updatePayload).eq("id", quoteId);
    },
    [quoteId]
  );

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        setGeneralError("");
        setSuccessMessage("");

        const quoteResult = await fetchQuote();

        if (!quoteResult) {
          throw new Error("Não encontrei a cotação. Verifique se o ID existe.");
        }

        setQuoteTable(quoteResult.table);

        let templateRow: TemplateRow | null = null;

        if (quoteResult.data.questionnaire_template_code) {
          templateRow = await fetchTemplateIdBySlug(quoteResult.data.questionnaire_template_code);
        }

        if (!templateRow && quoteResult.data.risk_type) {
          templateRow = await fetchTemplateByRisk(quoteResult.data.risk_type);
        }

        if (!templateRow) {
          throw new Error(
            "Não consegui descobrir o template do questionário. Verifique o risk_type e o questionnaire_template_code da cotação."
          );
        }

        setTemplate(templateRow);

        await ensureQuoteTemplateLinked(
          quoteResult.table,
          templateRow,
          quoteResult.data.risk_type
        );

        const [questionRows, savedAnswersMap] = await Promise.all([
          fetchQuestionsByTemplate(templateRow.id),
          fetchSavedAnswers(),
        ]);

        setQuestions(questionRows);
        setAnswers(savedAnswersMap);
      } catch (error: any) {
        setGeneralError(error?.message || "Erro ao carregar o questionário.");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [
    ensureQuoteTemplateLinked,
    fetchQuote,
    fetchQuestionsByTemplate,
    fetchSavedAnswers,
    fetchTemplateByRisk,
    fetchTemplateIdBySlug,
  ]);

  function validateForm() {
    const nextErrors: ErrorMap = {};

    for (const question of visibleQuestions) {
      const value = answers[String(question.id)];

      if (question.required && isEmptyValue(value)) {
        nextErrors[String(question.id)] = "Campo obrigatório";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildAnswerPayload(question: QuestionRow, rawValue: any) {
    const fieldType = formatFieldType(question.field_type);

    const payload: Record<string, any> = {
      quotation_id: quoteId,
      template_id: template?.id ?? null,
      question_id: question.id,
      answer_text: null,
      answer_boolean: null,
      answer_number: null,
      answer_json: null,
      updated_at: new Date().toISOString(),
    };

    if (isEmptyValue(rawValue)) {
      return payload;
    }

    if (fieldType === "number") {
      payload.answer_number = Number(rawValue);
      return payload;
    }

    if (fieldType === "boolean") {
      payload.answer_boolean = rawValue === true || rawValue === "true";
      return payload;
    }

    if (fieldType === "multiselect") {
      payload.answer_json = Array.isArray(rawValue) ? rawValue : [];
      return payload;
    }

    payload.answer_text = String(rawValue);
    return payload;
  }

  async function handleSave() {
    try {
      setGeneralError("");
      setSuccessMessage("");

      if (!template?.id) {
        setGeneralError("Template do questionário não encontrado.");
        return;
      }

      if (!validateForm()) {
        setGeneralError("Preencha todos os campos obrigatórios antes de salvar.");
        return;
      }

      setSaving(true);

      const payload = visibleQuestions.map((question) =>
        buildAnswerPayload(question, answers[String(question.id)])
      );

      const { error } = await supabase
        .from("quote_questionnaire_answers")
        .upsert(payload, {
          onConflict: "quotation_id,question_id",
        });

      if (error) {
        throw error;
      }

      setSuccessMessage("Questionário salvo com sucesso.");
    } catch (error: any) {
      setGeneralError(error?.message || "Erro ao salvar o questionário.");
    } finally {
      setSaving(false);
    }
  }

  function renderField(question: QuestionRow) {
    const key = String(question.id);
    const value = answers[key] ?? "";
    const fieldType = formatFieldType(question.field_type);
    const options = normalizeOptions(question.options_json);

    if (fieldType === "textarea") {
      return (
        <textarea
          value={value}
          onChange={(e) => setAnswerValue(question.id, e.target.value)}
          placeholder={question.placeholder || ""}
          className="min-h-[120px] w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
        />
      );
    }

    if (fieldType === "number") {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => setAnswerValue(question.id, e.target.value)}
          placeholder={question.placeholder || ""}
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
        />
      );
    }

    if (fieldType === "select") {
      return (
        <select
          value={value}
          onChange={(e) => setAnswerValue(question.id, e.target.value)}
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
        >
          <option value="">Selecione</option>
          {options.map((option) => (
            <option key={`${question.id}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (fieldType === "multiselect") {
      const selectedValues = Array.isArray(value) ? value : [];

      return (
        <div className="space-y-2 rounded-xl border border-zinc-300 p-4">
          {options.map((option) => {
            const checked = selectedValues.includes(option.value);

            return (
              <label
                key={`${question.id}-${option.value}`}
                className="flex items-center gap-3 text-sm text-zinc-700"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selectedValues.filter((v: string) => v !== option.value)
                      : [...selectedValues, option.value];

                    setAnswerValue(question.id, next);
                  }}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (fieldType === "boolean") {
      return (
        <select
          value={value === "" ? "" : String(value)}
          onChange={(e) => setAnswerValue(question.id, e.target.value)}
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
        >
          <option value="">Selecione</option>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setAnswerValue(question.id, e.target.value)}
        placeholder={question.placeholder || ""}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm text-zinc-500">Carregando questionário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                SegMax • Questionário de risco
              </p>
              <h1 className="mt-1 text-2xl font-bold text-zinc-900">
                {template?.title || "Questionário"}
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Cotação: <span className="font-medium">{quoteId}</span>
                {quoteTable ? (
                  <>
                    {" "}
                    • Tabela: <span className="font-medium">{quoteTable}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar questionário"}
              </button>
            </div>
          </div>

          {generalError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {generalError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}
        </div>

        {Object.keys(groupedQuestions).length === 0 ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-sm text-zinc-600">
              Nenhuma pergunta foi encontrada para este template.
            </p>
          </div>
        ) : null}

        {Object.entries(groupedQuestions).map(([section, sectionQuestions]) => (
          <div key={section} className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900">{section}</h2>

            <div className="mt-6 space-y-6">
              {sectionQuestions.map((question) => {
                const error = errors[String(question.id)];

                return (
                  <div key={question.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <label className="text-sm font-semibold text-zinc-800">
                        {question.question_order}. {question.question_text}
                      </label>

                      {question.required ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                          Obrigatório
                        </span>
                      ) : null}
                    </div>

                    {question.help_text ? (
                      <p className="text-xs text-zinc-500">{question.help_text}</p>
                    ) : null}

                    {renderField(question)}

                    {question.requires_acknowledgement ? (
                      <p className="text-xs text-amber-700">
                        Esta pergunta exige confirmação formal no fluxo técnico.
                      </p>
                    ) : null}

                    {error ? (
                      <p className="text-xs font-medium text-red-600">{error}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedQuestions).length > 0 ? (
          <div className="sticky bottom-4">
            <div className="rounded-3xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-zinc-600">
                  Revise as respostas obrigatórias antes de salvar.
                </p>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar questionário"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}