import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

import { supabase } from "../lib/supabase";

type PYQPaper = {
  year: number;
  paper: "GS1" | "GS2" | "GS3" | "GS4";
  url: string;
};

const PYQ_PAPERS: PYQPaper[] = [
  // =========================
  // 2026
  // =========================

  {
    year: 2026,
    paper: "GS1",
    url: "https://www.upsc.gov.in/sites/default/files/QP-CSM-26-010926-GENERAL%20STUDIES%20PAPER%20-%20I.pdf",
  },
  {
    year: 2026,
    paper: "GS2",
    url: "https://www.upsc.gov.in/sites/default/files/QP-CSM-26-010926-GENERAL-STUDIES-PAPER%20-%20II.pdf",
  },
  {
    year: 2026,
    paper: "GS3",
    url: "https://www.upsc.gov.in/sites/default/files/QP-CSM-26-010926-GENERAL-STUDIES-PAPER-III.pdf",
  },
  {
    year: 2026,
    paper: "GS4",
    url: "https://www.upsc.gov.in/sites/default/files/QP-CSM-26-010926-GENERAL-STUDIES-PAPER-IV.pdf",
  },

  // =========================
  // 2025
  // =========================

  {
    year: 2025,
    paper: "GS1",
    url: "https://www.upsc.gov.in/sites/default/files/GENERAL-STUDIES-PAPER%20I-QP-CSM-25-010925.pdf",
  },
  {
    year: 2025,
    paper: "GS2",
    url: "https://www.upsc.gov.in/sites/default/files/GENERAL-STUDIES-PAPER-II-QP-CSM-25-010925.pdf",
  },
  {
    year: 2025,
    paper: "GS3",
    url: "https://www.upsc.gov.in/sites/default/files/GENERAL-STUDIES-PAPER-III-QP-CSM-25-010925.pdf",
  },
  {
    year: 2025,
    paper: "GS4",
    url: "https://www.upsc.gov.in/sites/default/files/GENERAL-STUDIES-PAPER-IV-QP-CSM-25-010925.pdf",
  },

  // =========================
  // 2024
  // =========================

  {
    year: 2024,
    paper: "GS1",
    url: "https://www.upsc.gov.in/sites/default/files/QP_CSM_2024_GenStud_I_03102024.pdf",
  },
  {
    year: 2024,
    paper: "GS2",
    url: "https://www.upsc.gov.in/sites/default/files/QP_CSM_2024_GenStud_II_03102024.pdf",
  },
  {
    year: 2024,
    paper: "GS3",
    url: "https://www.upsc.gov.in/sites/default/files/QP_CSM_2024_GenStud_III_03102024.pdf",
  },
  {
    year: 2024,
    paper: "GS4",
    url: "https://www.upsc.gov.in/sites/default/files/QP_CSM_2024_GenStud_IV_03102024.pdf",
  },

  // =========================
  // 2023
  // =========================

  {
    year: 2023,
    paper: "GS1",
    url: "https://www.upsc.gov.in/sites/default/files/QP-CSM-23-GENERAL-STUDIES-PAPER-I-180923.pdf",
  },
  {
    year: 2023,
    paper: "GS2",
    url: "https://www.upsc.gov.in/sites/default/files/QP-CSM-23-GENERAL-STUDIES-PAPER-II-180923.pdf",
  },
  {
    year: 2023,
    paper: "GS3",
    url: "https://www.upsc.gov.in/sites/default/files/QP-CSM-23-GENERAL-STUDIES-PAPER-III-180923.pdf",
  },
  {
    year: 2023,
    paper: "GS4",
    url: "https://www.upsc.gov.in/sites/default/files/QP-CSM-23-GENERAL-STUDIES-PAPER-IV-180923.pdf",
  },
];

function getExpectedQuestions(
  paper: PYQPaper
): number {
  return paper.paper === "GS4" ? 12 : 20;
}

async function fetchPDF(
  url: string,
  retries = 3
): Promise<Buffer> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36",
          Accept: "application/pdf,*/*",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download PDF: ${response.status} ${response.statusText}`
        );
      }

      const arrayBuffer =
        await response.arrayBuffer();

      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error;

      console.warn(
        `  Download attempt ${attempt}/${retries} failed.`
      );

      if (attempt < retries) {
        const delayMs = attempt * 2000;

        console.log(
          `  Retrying download in ${delayMs / 1000}s...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delayMs)
        );
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to download PDF");
}

function cleanOCRText(
  text: string
): string {
  return text
    .replace(/\r/g, "")
    .replace(/\f/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function extractQuestions(text: string) {
  const normalized = text
    .replace(/\r/g, "")
    .replace(/\f/g, "\n");

  /*
   * OCR commonly misreads UPSC question numbers:
   *   19 -> 1g / 1q / 1? / l9
   *   11 -> ll / 1l / I1
   *   16 -> 1b / 1G / lb
   *
   * We therefore use both normal numeric patterns and a tolerant
   * OCR pattern. The tolerant pattern is only accepted when the
   * resulting sequence is plausible, so ordinary numbers inside
   * question text are not blindly treated as question numbers.
   */
  const patterns = [
    /(?:^|\n)\s*(20|1[0-9]|[1-9])\s*[\.\):\-]\s*/gm,
    /(?:^|\n)\s*Q(?:uestion)?\s*\.?\s*(20|1[0-9]|[1-9])\s*[\.\):\-]?\s+/gim,
    /(?:^|\s)(20|1[0-9]|[1-9])\s*[\.\):\-]\s+/g,
    /(?:^|\n)\s*([lI1][0-9gqGQlb]|[0-9]{1,2})\s*[\.\):\-]\s+/gm,
  ];

  const normalizeOCRQuestionNumber = (
    raw: string
  ): number | null => {
    let value = raw
      .trim()
      .replace(/[Il|]/g, "1")
      .replace(/[gqGQ]/g, "9")
      .replace(/[bB]/g, "6");

    if (!/^\d{1,2}$/.test(value)) {
      return null;
    }

    const number = Number(value);

    return number >= 1 && number <= 20
      ? number
      : null;
  };

  let bestQuestions: {
    questionNumber: number;
    question: string;
  }[] = [];

  let bestScore = -1;

  for (const regex of patterns) {
    const matches = [...normalized.matchAll(regex)];

    const questions: {
      questionNumber: number;
      question: string;
    }[] = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];

      const questionNumber =
        normalizeOCRQuestionNumber(match[1]);

      if (questionNumber === null) {
        continue;
      }

      const startIndex =
        (match.index ?? 0) + match[0].length;

      const endIndex =
        i + 1 < matches.length
          ? matches[i + 1].index ?? normalized.length
          : normalized.length;

      let question = cleanOCRText(
        normalized.slice(startIndex, endIndex)
      );

      question = question
        .replace(/\(Answer in 150 words\)/gi, "")
        .replace(/\(Answer in 250 words\)/gi, "")
        .replace(/Answer in 150 words/gi, "")
        .replace(/Answer in 250 words/gi, "")
        .replace(/SLPM-[A-Z0-9-]+/gi, "")
        .replace(/QP-[A-Z0-9-]+/gi, "")
        .replace(/\s+\d{1,3}\s*$/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (question.length < 30) {
        continue;
      }

      questions.push({
        questionNumber,
        question,
      });
    }

    const unique = new Map<number, string>();

    for (const question of questions) {
      if (!unique.has(question.questionNumber)) {
        unique.set(
          question.questionNumber,
          question.question
        );
      }
    }

    const result = Array.from(unique.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([questionNumber, question]) => ({
        questionNumber,
        question,
      }));

    let sequential = 0;

    for (let n = 1; n <= 20; n++) {
      if (unique.has(n)) {
        sequential++;
      } else {
        break;
      }
    }

    const score = sequential * 1000 + result.length;

    if (score > bestScore) {
      bestScore = score;
      bestQuestions = result;
    }
  }

  return bestQuestions;
}

type OCRMode = "3" | "4" | "6" | "11" | "12";

function ocrPDF(
  pdfBuffer: Buffer,
  psm: OCRMode
): string {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "upsc-pyq-")
  );

  const pdfPath = path.join(
    tempDir,
    "paper.pdf"
  );

  const imagePrefix = path.join(
    tempDir,
    "page"
  );

  try {
    fs.writeFileSync(pdfPath, pdfBuffer);

    /*
     * Convert PDF pages into high-resolution PNG images.
     * 350 DPI improves recognition of small question numbers
     * and punctuation without changing the source content.
     */
    execFileSync(
      "pdftoppm",
      [
        "-png",
        "-r",
        "400",
        pdfPath,
        imagePrefix,
      ],
      {
        stdio: "ignore",
      }
    );

    const files = fs
      .readdirSync(tempDir)
      .filter((file) =>
        /^page-\d+\.png$/.test(file)
      )
      .sort((a, b) => {
        const aNum = Number(
          a.match(/\d+/)?.[0] || 0
        );

        const bNum = Number(
          b.match(/\d+/)?.[0] || 0
        );

        return aNum - bNum;
      });

    let fullText = "";

    for (const file of files) {
      const imagePath = path.join(
        tempDir,
        file
      );

      console.log(
        `    OCR (PSM ${psm}): ${file}`
      );

      const ocrText = execFileSync(
        "tesseract",
        [
          imagePath,
          "stdout",
          "-l",
          "eng",
          "--oem",
          "1",
          "--psm",
          psm,
          "-c",
          "preserve_interword_spaces=1",
        ],
        {
          encoding: "utf8",
          maxBuffer: 20 * 1024 * 1024,
        }
      );

      fullText += `\n${ocrText}\n`;
    }

    return fullText;
  } finally {
    fs.rmSync(tempDir, {
      recursive: true,
      force: true,
    });
  }
}

async function ingestPYQs() {
  console.log(
    "Starting official UPSC PYQ ingestion with multi-mode OCR...\n"
  );
  console.log(
    "Processing all configured years: 2026, 2025, 2024, 2023.\n"
  );

  for (const paper of PYQ_PAPERS) {
    console.log(
      `Processing ${paper.year} ${paper.paper}...`
    );

    try {
      const expectedQuestions =
        getExpectedQuestions(
          paper
        );

      const buffer =
        await fetchPDF(
          paper.url
        );

      console.log(
        `  Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
      );

      /*
       * Try several Tesseract page segmentation modes.
       *
       * PSM 3  = automatic page segmentation
       * PSM 4  = column-aware page segmentation
       * PSM 6  = uniform block of text
       * PSM 11 = sparse text detection
       *
       * UPSC PDFs can have layouts that OCR engines interpret
       * differently, so we keep the strongest extraction.
       */
      const psmModes: OCRMode[] = [
        "3",
        "4",
        "6",
        "11",
        "12",
      ];

      let questions: {
        questionNumber: number;
        question: string;
      }[] = [];

      let bestPSM: OCRMode | null = null;

      for (const psm of psmModes) {
        console.log(
          `  Running OCR with PSM ${psm}...`
        );

        const ocrText = ocrPDF(
          buffer,
          psm
        );

        console.log(
          `  PSM ${psm} OCR text length: ${ocrText.length} characters`
        );

        const candidateQuestions =
          extractQuestions(ocrText);

        console.log(
          `  PSM ${psm} extracted ${candidateQuestions.length} questions`
        );

        if (
          candidateQuestions.length >
          questions.length
        ) {
          questions = candidateQuestions;
          bestPSM = psm;
        }

        if (
          candidateQuestions.length ===
          expectedQuestions
        ) {
          console.log(
            `  ✓ PSM ${psm} produced the expected ${expectedQuestions} questions.`
          );
          questions = candidateQuestions;
          bestPSM = psm;
          break;
        }
      }

      if (bestPSM) {
        console.log(
          `  Best OCR result: PSM ${bestPSM} (${questions.length} questions)`
        );
      }

      /*
       * Final validation.
       */
      if (
        questions.length !==
        expectedQuestions
      ) {
        console.warn(
          `  ⚠ Expected ${expectedQuestions} questions but found ${questions.length}.`
        );

        const detectedNumbers = new Set(
          questions.map(
            (q) => q.questionNumber
          )
        );

        const missingNumbers = Array.from(
          { length: expectedQuestions },
          (_, index) => index + 1
        ).filter(
          (number) => !detectedNumbers.has(number)
        );

        console.warn(
          "  Detected question numbers:",
          questions.map(
            (q) =>
              q.questionNumber
          )
        );

        console.warn(
          "  Missing question numbers:",
          missingNumbers
        );

        console.warn(
          "  Skipping this paper. No incomplete data will be inserted.\n"
        );

        continue;
      }

      /*
       * Create Supabase records.
       */
      const records =
        questions.map(
          (question) => ({
            year: paper.year,
            exam:
              "Civil Services (Main)",
            paper: paper.paper,
            question:
              question.question,
            topic: null,
            subtopic: null,
            keywords: [],
            question_number:
              question.questionNumber,
            source_url:
              paper.url,
          })
        );

      const {
        error,
      } = await supabase
        .from("pyqs")
        .upsert(
          records,
          {
            onConflict:
              "source_url,question_number",
          }
        );

      if (error) {
        console.error(
          `  ✗ Supabase error: ${error.message}\n`
        );
        continue;
      }

      console.log(
        `  ✓ Inserted/updated ${records.length} questions\n`
      );
    } catch (error) {
      console.error(
        `  ✗ Failed ${paper.year} ${paper.paper}:`,
        error
      );

      console.log("");
    }
  }

  console.log(
    "Official UPSC PYQ ingestion complete."
  );
}

ingestPYQs();