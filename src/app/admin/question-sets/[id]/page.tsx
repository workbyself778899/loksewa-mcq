'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiCpu, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  questionSet: string;
  createdBy: any;
}

interface QuestionSet {
  _id: string;
  name: string;
  description: string;
  course: string | { _id: string };

}

/**
 * Admin Questions Management Page for a specific question set
 */
export default function AdminQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const questionSetId = params.id as string;
  const { isDark } = useTheme();
  const { user, token, isAuthenticated } = useAuth();

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 0,
  });

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [importTab, setImportTab] = useState<'pdf' | 'text'>('pdf');
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [parsedQuestions, setParsedQuestions] = useState<{
    questionText: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[]>([]);

  // Dynamically load pdf.js from CDN
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.async = true;
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          const pdfjsLib = (window as any).pdfjsLib;
          if (!pdfjsLib) {
            throw new Error('PDF.js library is not loaded yet. Please wait a moment and try again.');
          }

          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }

          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsArrayBuffer(file);
    });
  };

  const parseMCQText = (text: string) => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const questions: {
      questionText: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }[] = [];

    let currentQuestion = '';
    let currentOptions: string[] = [];
    let correctAnswer = 0;
    let explanation = '';

    // Also detect lines wrapped in ** (bold) or == (highlight) as options with correct marker
    const questionStartRegex = /^(?:Q|q)?\s*([०-९\d]+)\s*[\.\):-]\s*(.*)$/u;
    const optionStartRegex = /^\s*(?:\*\*)?[\(\[]?\s*([A-Da-dकखगघ])\s*[.\)\s\]\-]\s*(.*?)(?:\*\*)?$/u;
    const answerLineRegex = /(?:Ans|Answer|Correct|Correct Answer|उत्तर)\s*[.:\-]?\s*([A-D])/i;

    const saveCurrentQuestion = () => {
      if (currentQuestion && currentOptions.length > 0) {
        const finalOptions = [...currentOptions];
        while (finalOptions.length < 4) {
          finalOptions.push(`Option ${String.fromCharCode(65 + finalOptions.length)}`);
        }
        questions.push({
          questionText: currentQuestion.trim(),
          options: finalOptions.slice(0, 4),
          correctAnswer,
          explanation: explanation.trim(),
        });
      }
    };

    for (let i = 0; i < lines.length; i++) {
      // Normalise Devanagari digits to ASCII for regex matching
      const rawLine = lines[i];
      const line = rawLine.replace(/[०-९]/g, (d) =>
        String(d.codePointAt(0)! - 0x0966)
      );

      const questionMatch = line.match(questionStartRegex);
      if (questionMatch) {
        saveCurrentQuestion();
        // Use the original (raw) line text after the number+separator for the question
        currentQuestion = rawLine.replace(/^[०-९\d]+\s*[.\):-]\s*/, '').trim();
        currentOptions = [];
        correctAnswer = 0;
        explanation = '';
        continue;
      }

      const ansMatch = line.match(answerLineRegex);
      if (ansMatch) {
        const ansChar = ansMatch[1].toUpperCase();
        correctAnswer = ansChar.charCodeAt(0) - 65;
        continue;
      }

      // Check for inline options on a single line
      const inlineRegex = /(?:^|\s)[\(\[]?\s*([A-D])\s*[\.\)\s\]-]\s*/gi;
      const inlineMatches = [];
      let match;
      while ((match = inlineRegex.exec(line)) !== null) {
        inlineMatches.push({
          letter: match[1].toUpperCase(),
          index: match.index,
          length: match[0].length
        });
      }

      if (inlineMatches.length > 1) {
        for (let j = 0; j < inlineMatches.length; j++) {
          const startIdx = inlineMatches[j].index + inlineMatches[j].length;
          const endIdx = j < inlineMatches.length - 1 ? inlineMatches[j + 1].index : line.length;
          let optText = line.substring(startIdx, endIdx).trim();

          // Detect bold (**text**), ==highlight==, ✓, *, or [x] as correct answer marker
          const isMarked = optText.startsWith('*') || optText.endsWith('*') ||
            optText.startsWith('✓') || optText.endsWith('✓') ||
            optText.includes('[x]') || optText.includes('[X]') ||
            /^\*\*.*\*\*$/.test(optText) || /^==.*==$/.test(optText);

          // Strip bold (**), highlight (==), asterisk, checkmark markers
          optText = optText
            .replace(/^\*\*(.*?)\*\*$/, '$1')
            .replace(/^==(.*?)==$/, '$1')
            .replace(/^[\*✓\s]+|[\*✓\s]+$/g, '')
            .trim();

          if (currentOptions.length < 4) {
            currentOptions.push(optText);
            if (isMarked) {
              correctAnswer = inlineMatches[j].letter.charCodeAt(0) - 65;
            }
          }
        }
        continue;
      }

      const optionMatch = line.match(optionStartRegex);
      if (optionMatch) {
        const optLetter = optionMatch[1].toUpperCase();
        let optText = optionMatch[2].trim();

        // Detect bold (**text**), ==highlight==, ✓, *, or [x] as correct answer marker
        const isMarked = optText.startsWith('*') || optText.endsWith('*') ||
          optText.startsWith('✓') || optText.endsWith('✓') ||
          optText.includes('[x]') || optText.includes('[X]') ||
          /^\*\*.*\*\*$/.test(optText) || /^==.*==$/.test(optText);

        // Strip bold (**), highlight (==), asterisk, checkmark markers
        optText = optText
          .replace(/^\*\*(.*?)\*\*$/, '$1')
          .replace(/^==(.*?)==$/, '$1')
          .replace(/^[\*✓\s]+|[\*✓\s]+$/g, '')
          .trim();

        if (currentOptions.length < 4) {
          currentOptions.push(optText);
          if (isMarked) {
            correctAnswer = optLetter.charCodeAt(0) - 65;
          }
        }
        continue;
      }

      if (currentQuestion && currentOptions.length === 0) {
        currentQuestion += ' ' + line;
      } else if (currentOptions.length > 0 && currentOptions.length < 4) {
        currentOptions[currentOptions.length - 1] += ' ' + line;
      } else if (currentQuestion && currentOptions.length === 4) {
        if (line.toLowerCase().startsWith('explanation:') || line.toLowerCase().startsWith('exp:')) {
          explanation = line.replace(/^(?:explanation|exp)\s*[\.:-]?\s*/i, '').trim();
        } else {
          explanation += ' ' + line;
        }
      }
    }

    saveCurrentQuestion();
    return questions;
  };

  const handleImportProcess = async () => {
    try {
      setIsProcessingImport(true);
      let textToParse = '';

      if (importTab === 'pdf') {
        if (!importFile) {
          toast.error('Please select a PDF file first');
          return;
        }
        textToParse = await extractTextFromPDF(importFile);
      } else {
        if (!pastedText.trim()) {
          toast.error('Please paste some text first');
          return;
        }
        textToParse = pastedText;
      }

      const questions = parseMCQText(textToParse);

      if (questions.length === 0) {
        throw new Error('No questions could be parsed from the input. Please verify the format.');
      }

      setParsedQuestions(questions);
      setImportStep('preview');
      toast.success(`Successfully parsed ${questions.length} questions! Please review them.`);
    } catch (error: any) {
      toast.error(error.message || 'Error parsing questions');
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleParsedQuestionChange = (
    index: number,
    field: string,
    value: any,
    optionIndex?: number
  ) => {
    setParsedQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== index) return q;
        if (field === 'option' && optionIndex !== undefined) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return { ...q, [field]: value };
      })
    );
  };

  const handleDeleteParsedQuestion = (index: number) => {
    setParsedQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveImportedQuestions = async () => {
    if (parsedQuestions.length === 0) {
      toast.error('No questions to import');
      return;
    }

    try {
      setIsProcessingImport(true);

      const payload = parsedQuestions.map((q) => ({
        ...q,
        questionSet: questionSetId,
      }));

      const res = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions: payload }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to import questions');
      }

      const data = await res.json();
      toast.success(`${data.questions.length} questions imported successfully!`);
      setQuestions((prev) => [...prev, ...data.questions]);
      closeImportModal();
    } catch (error: any) {
      toast.error(error.message || 'Error importing questions');
    } finally {
      setIsProcessingImport(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setPastedText('');
    setImportStep('upload');
    setParsedQuestions([]);
  };

  // Check admin access and fetch data
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch question set details
        const setRes = await fetch(`/api/question-sets/${questionSetId}`);
        if (setRes.ok) {
          const setData = await setRes.json();
          setQuestionSet(setData.questionSet);
        }

        // Fetch questions for this set (admin token required for correct answers)
        const questionsRes = await fetch(`/api/questions?questionSetId=${questionSetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          setQuestions(questionsData.questions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, router, questionSetId, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'correctAnswer' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingQuestion ? `/api/questions/${editingQuestion._id}` : '/api/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const body = {
        questionText: formData.question,
        options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
        correctAnswer: formData.correctAnswer,
        ...(editingQuestion ? {} : { questionSet: questionSetId }),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save question');
      }

      const data = await res.json();
      toast.success(editingQuestion ? 'Question updated!' : 'Question created!');

      if (editingQuestion) {
        setQuestions(questions.map((q) => (q._id === editingQuestion._id ? data.question : q)));
      } else {
        setQuestions([...questions, data.question]);
      }

      setShowForm(false);
      setFormData({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 0,
      });
      setEditingQuestion(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(questions.filter((q) => q._id !== questionId));
      toast.success('Question deleted!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.questionText,
      optionA: question.options[0],
      optionB: question.options[1],
      optionC: question.options[2],
      optionD: question.options[3],
      correctAnswer: question.correctAnswer,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setFormData({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 0,
    });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} py-8 ${isDark ? 'text-white' : 'text-gray-600'} px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href={`/admin/courses/${typeof questionSet?.course === 'string' ? questionSet.course : questionSet?.course?._id}`} className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4">
              <FiArrowLeft /> Back to Question Sets
            </Link>
            <h1 className="text-3xl font-bold">Questions for {questionSet?.name}</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{questionSet?.description}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowImportModal(true);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${isDark
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
            >
              <FiUpload /> Import Questions (PDF/Text)
            </button>
            <button
              onClick={() => {
                setEditingQuestion(null);
                setFormData({
                  question: '',
                  optionA: '',
                  optionB: '',
                  optionC: '',
                  optionD: '',
                  correctAnswer: 0,
                });
                setShowForm(true);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${isDark
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
              <FiPlus /> Add Question
            </button>
          </div>
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div
              className={`rounded-lg p-8 w-full max-w-4xl my-8 max-h-[90vh] flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'
                }`}
            >
              <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-800 text-gray-900 dark:text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-purple-500">
                  <FiCpu /> Local PDF & Text MCQ Importer
                </h2>
                <button
                  onClick={closeImportModal}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                  disabled={isProcessingImport}
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {importStep === 'upload' ? (
                <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                  {/* Explanation card */}
                  <div className={`p-4 rounded-lg flex items-start gap-3 text-sm ${isDark ? 'bg-gray-805' : 'bg-blue-50'}`} style={{ backgroundColor: isDark ? '#1e293b' : '#eff6ff' }}>
                    <FiAlertTriangle className="text-purple-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1 text-gray-950 dark:text-white">Local Text Extraction (No AI):</p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        Directly extracts plain text from your PDF or pasted question paper.
                        To automatically detect the correct answer, prefix or suffix the correct option with an asterisk (e.g. <strong>*A. Option</strong> or <strong>A. *Option</strong>), a checkmark <strong>✓</strong>, or write <strong>Answer: A</strong> / <strong>Ans: B</strong> on the next line.
                      </p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b dark:border-gray-700">
                    <button
                      onClick={() => setImportTab('pdf')}
                      className={`px-6 py-3 font-semibold transition border-b-2 outline-none ${importTab === 'pdf'
                        ? 'border-purple-500 text-purple-500'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                      Upload PDF File
                    </button>
                    <button
                      onClick={() => setImportTab('text')}
                      className={`px-6 py-3 font-semibold transition border-b-2 outline-none ${importTab === 'text'
                        ? 'border-purple-500 text-purple-500'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                      Paste Question Text
                    </button>
                  </div>

                  {importTab === 'pdf' ? (
                    /* PDF Drop zone */
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${importFile
                        ? 'border-purple-500 bg-purple-500/5'
                        : isDark
                          ? 'border-gray-700 hover:border-purple-500 bg-gray-800/50 text-white'
                          : 'border-gray-300 hover:border-purple-500 bg-gray-50 text-gray-950'
                        }`}
                      onClick={() => document.getElementById('file-upload-input')?.click()}
                    >
                      <input
                        type="file"
                        id="file-upload-input"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                      <FiUpload className="mx-auto w-12 h-12 text-purple-500 mb-3" />
                      {importFile ? (
                        <div>
                          <p className="font-semibold text-lg text-gray-950 dark:text-white">{importFile.name}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {(importFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-lg text-gray-950 dark:text-white">Drag & Drop or Click to Upload PDF</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Supports PDF files containing text (Max 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Pasted text zone */
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Paste Question Paper Text
                      </label>
                      <textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder={`1. What is the capital of Nepal?
A) New Delhi
B) Beijing
*C) Kathmandu
D) Tokyo

१. संयुक्त राष्ट्रसंघका लागि नेपालको पहिलो स्थायी प्रतिनिधि को हुन्?
A) कुलचन्द्र गौतम
**B) ज्ञानचन्द्र आचार्य**
C) ऋषिकेश शाह
D) भोजराज घिमिरे

2. Which planet is known as the Red Planet?
A) Earth
B) Venus
C) Jupiter
D) Mars
Answer: D`}
                        rows={12}
                        className={`w-full px-4 py-3 rounded-lg border transition text-sm font-mono ${isDark
                          ? 'bg-gray-800 border-gray-700 focus:border-purple-500 text-white'
                          : 'bg-gray-50 border-gray-300 focus:border-purple-500 text-gray-900'
                          } outline-none`}
                      />

                      {/* Sample question card with highlighted correct answer */}
                      <div className={`mt-3 p-4 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`font-semibold mb-2 text-xs uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>📝 Sample — mark correct answer with <code className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 rounded">**B) text**</code> or <code className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 rounded">*B) text</code> or <code className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 rounded">Answer: B</code></p>
                        <p className={`font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>१. संयुक्त राष्ट्रसंघका लागि नेपालको पहिलो स्थायी प्रतिनिधि को हुन्?</p>
                        <ul className="space-y-0.5 ml-2">
                          <li className={isDark ? 'text-gray-300' : 'text-gray-700'}>A) कुलचन्द्र गौतम</li>
                          <li className="font-bold" style={{ color: '#d97706', background: 'rgba(251,191,36,0.15)', borderRadius: '4px', padding: '1px 4px' }}>B) ज्ञानचन्द्र आचार्य ✓</li>
                          <li className={isDark ? 'text-gray-300' : 'text-gray-700'}>C) ऋषिकेश शाह</li>
                          <li className={isDark ? 'text-gray-300' : 'text-gray-700'}>D) भोजराज घिमिरे</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <button
                    onClick={handleImportProcess}
                    disabled={isProcessingImport || (importTab === 'pdf' && !importFile) || (importTab === 'text' && !pastedText.trim())}
                    className={`w-full py-3 rounded-lg font-semibold transition ${isProcessingImport || (importTab === 'pdf' && !importFile) || (importTab === 'text' && !pastedText.trim())
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                      } ${isDark
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                  >
                    {isProcessingImport ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        Extracting & Parsing Questions...
                      </span>
                    ) : (
                      'Parse Questions'
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 text-gray-900 dark:text-white">
                  <div className="mb-4">
                    <p className={`text-sm ${isDark ? 'text-gray-450' : 'text-gray-600'}`} style={{ color: isDark ? '#94a3b8' : '#4b5563' }}>
                      Review and edit the parsed questions below. Correct any option texts, select the correct answer, and delete any unwanted questions.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 min-h-0 pb-4">
                    {parsedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className={`p-6 rounded-lg border relative ${isDark ? 'bg-gray-850 border-gray-750' : 'bg-gray-50 border-gray-250'
                          }`}
                        style={{
                          backgroundColor: isDark ? '#1e293b' : '#f9fafb',
                          borderColor: isDark ? '#334155' : '#e5e7eb'
                        }}
                      >
                        <button
                          onClick={() => handleDeleteParsedQuestion(idx)}
                          className="absolute top-4 right-4 text-red-500 hover:text-red-650 p-1 rounded-lg hover:bg-red-500/10 transition"
                          title="Delete Question"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>

                        <span className="text-xs font-bold text-purple-500">Question {idx + 1}</span>

                        <div className="space-y-4 mt-2">
                          {/* Question Text */}
                          <div>
                            <label className="block text-xs font-semibold mb-1">Question Text</label>
                            <textarea
                              value={q.questionText}
                              onChange={(e) => handleParsedQuestionChange(idx, 'questionText', e.target.value)}
                              rows={2}
                              className={`w-full px-3 py-1.5 rounded border text-sm transition outline-none ${isDark
                                ? 'bg-gray-900 border-gray-700 focus:border-purple-500 text-white'
                                : 'bg-white border-gray-300 focus:border-purple-500 text-gray-900'
                                }`}
                            />
                          </div>

                          {/* Options */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx}>
                                <label className="block text-xs font-semibold mb-1">Option {String.fromCharCode(65 + optIdx)}</label>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleParsedQuestionChange(idx, 'option', e.target.value, optIdx)}
                                  className={`w-full px-3 py-1.5 rounded border text-sm transition outline-none ${isDark
                                    ? 'bg-gray-900 border-gray-700 focus:border-purple-500 text-white'
                                    : 'bg-white border-gray-300 focus:border-purple-500 text-gray-900'
                                    }`}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Correct Answer & Explanation */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold mb-2">Correct Option</label>
                              <div className="flex gap-4">
                                {[0, 1, 2, 3].map((optIdx) => (
                                  <label key={optIdx} className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input
                                      type="radio"
                                      name={`correctImport-${idx}`}
                                      value={optIdx}
                                      checked={q.correctAnswer === optIdx}
                                      onChange={() => handleParsedQuestionChange(idx, 'correctAnswer', optIdx)}
                                      className="w-4 h-4"
                                    />
                                    <span>{String.fromCharCode(65 + optIdx)}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold mb-1">Explanation</label>
                              <input
                                type="text"
                                value={q.explanation}
                                onChange={(e) => handleParsedQuestionChange(idx, 'explanation', e.target.value)}
                                placeholder="Explain correct answer..."
                                className={`w-full px-3 py-1.5 rounded border text-sm transition outline-none ${isDark
                                  ? 'bg-gray-900 border-gray-700 focus:border-purple-500 text-white'
                                  : 'bg-white border-gray-300 focus:border-purple-500 text-gray-900'
                                  }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4 flex justify-between items-center dark:border-gray-800">
                    <button
                      onClick={() => setImportStep('upload')}
                      className={`px-4 py-2 border rounded-lg transition ${isDark ? 'border-gray-700 hover:bg-gray-800 text-white animate-pulse-subtle' : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      disabled={isProcessingImport}
                    >
                      Back to Upload
                    </button>
                    <span className="font-semibold text-sm">
                      Total Parse Count: <span className="text-purple-500">{parsedQuestions.length}</span>
                    </span>
                    <button
                      onClick={handleSaveImportedQuestions}
                      disabled={isProcessingImport || parsedQuestions.length === 0}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${isProcessingImport || parsedQuestions.length === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                        } ${isDark
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                        }`}
                    >
                      {isProcessingImport ? 'Saving...' : 'Confirm & Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-white'
                }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Question</label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Enter your MCQ question..."
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border transition ${isDark
                      ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                      : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                      } outline-none`}
                  />
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((label, index) => (
                    <div key={index}>
                      <label className="block text-sm font-semibold mb-2">Option {label}</label>
                      <input
                        type="text"
                        name={`option${label}`}
                        value={formData[`option${label}` as keyof typeof formData] as string}
                        onChange={handleInputChange}
                        placeholder={`Option ${label}`}
                        className={`w-full px-4 py-2 rounded-lg border transition ${isDark
                          ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                          } outline-none`}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Correct Answer</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <label key={index} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={index}
                          checked={formData.correctAnswer === index}
                          onChange={handleInputChange}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="font-semibold">Option {String.fromCharCode(65 + index)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-semibold transition ${isDark
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white'
                    }`}
                >
                  {isSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div
              className={`rounded-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No questions yet. Add your first question!</p>
            </div>
          ) : (
            questions.map((question, idx) => (
              <div
                key={question._id}
                className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">
                      Question {idx + 1}: {question.questionText}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(question)}
                      className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Options Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-lg border-2 transition ${optIdx === question.correctAnswer
                        ? isDark
                          ? 'bg-green-900/30 border-green-600'
                          : 'bg-green-50 border-green-500'
                        : isDark
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-100 border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{option}</span>
                        {optIdx === question.correctAnswer && (
                          <span className="ml-auto text-green-500 font-bold text-xs">✓ Correct</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Total Questions: <span className="text-blue-500">{questions.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
