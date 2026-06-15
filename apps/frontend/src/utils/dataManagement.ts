import ExcelJS from "exceljs";
import {
  JobApplication,
  JobType,
  WorkSetup,
  ApplicationMethod,
  ApplicationStatus,
  PriorityType,
  InterviewTypes,
} from "@career-sync/shared";

const REQUIRED_HEADERS = [
  "Company",
  "Job Description",
  "Role",
  "Applied Date",
  "Application Method",
] as const;

export const importJobsFromExcel = async (
  file: File,
): Promise<JobApplication[]> => {
  const workbook = new ExcelJS.Workbook();

  const buffer = await file.arrayBuffer();

  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet("Job Applications");

  if (!worksheet) {
    throw new Error(
      "Missing worksheet: 'Job Applications'. Please ensure the sheet tab is named 'Job Applications'.",
    );
  }

  const headerRow = worksheet.getRow(4);
  const headers = headerRow.values as string[];

  const missingHeaders = REQUIRED_HEADERS.filter(
    (required) => !headers.includes(required),
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  const jobs: JobApplication[] = [];
  const errors: string[] = [];

  const validateString = (
    value: string | undefined,
    fieldName: string,
    minLength: number,
  ): string | null => {
    const trimmed = value?.trim() ?? "";

    if (!trimmed) {
      return `${fieldName} is required`;
    }

    if (trimmed.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }

    return null;
  };

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 4) return;

    const values = row.values as unknown[];

    const job: Partial<JobApplication> = {
      company: "",
      roleTitle: "",
      jobDescription: "",
      interviewStages: [],
    };

    headers.forEach((header, columnIndex) => {
      const value = values[columnIndex];

      switch (header) {
        case "Company":
          job.company = String(value ?? "");
          break;

        case "Job Description":
          job.jobDescription = String(value ?? "");
          break;

        case "Job Link":
          job.jobLink = String(value ?? "");
          break;

        case "Role":
          job.roleTitle = String(value ?? "");
          break;

        case "Job Type":
          job.jobType = String(value ?? "Full-time") as JobType;
          break;

        case "Salary":
          job.salary = String(value ?? "");
          break;

        case "Location":
          job.location = String(value ?? "");
          break;

        case "Work Schedule":
          job.workSchedule = String(value ?? "");
          break;

        case "Work Setup":
          job.workSetup = String(value ?? "On-site") as WorkSetup;
          break;

        case "Application Method":
          job.applicationMethod = String(
            value ?? "LinkedIn",
          ) as ApplicationMethod;
          break;

        case "Applied Date":
          job.applicationDate = value
            ? new Date(String(value)).toISOString()
            : undefined;
          break;

        case "Status":
          job.status = String(value ?? "Applied") as ApplicationStatus;
          break;

        case "Priority":
          job.priority = String(value ?? "Low") as PriorityType;
          break;

        case "Notes":
          job.notes = String(value ?? "");
          break;

        default:
          if (header?.startsWith("Interview Stage")) {
            const stageText = String(value ?? "").trim();

            if (!stageText) return;

            const stage: Record<string, string> = {};

            stageText.split("\n").forEach((line) => {
              const [key, ...rest] = line.split(":");

              if (!key || rest.length === 0) return;

              stage[key.trim()] = rest.join(":").trim();
            });

            job.interviewStages?.push({
              id: crypto.randomUUID(),
              jobId: "",
              interviewType: (stage.Type || "HR Screening") as InterviewTypes,
              interviewDate: stage.Date || "",
              interviewTime: stage.Time || "",
              interviewerName: stage.Interviewer || "",
              interviewComment: stage.Comment || "",
            });
          }
      }
    });

    const rowErrors = [
      validateString(job.company, "Company", 2),
      validateString(job.roleTitle, "Role", 2),
      validateString(job.jobDescription, "Job Description", 10),
    ].filter(Boolean);

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNumber}: ${rowErrors.join(", ")}`);
    }

    jobs.push(job as JobApplication);
  });

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return jobs;
};

export const exportJobsToExcel = async (
  jobs: JobApplication[],
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Career Sync";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Job Applications");

  // =====================================
  // Dynamic Interview Stage Columns
  // =====================================

  const maxInterviewStages = Math.max(
    ...jobs.map((job) => job.interviewStages?.length ?? 0),
    0,
  );

  const interviewColumns = Array.from(
    { length: maxInterviewStages },
    (_, index) => ({
      header: `Interview Stage ${index + 1}`,
      key: `stage${index + 1}`,
      width: 45,
    }),
  );

  // =====================================
  // Main Columns
  // =====================================

  const columns = [
    { header: "#", key: "number", width: 8 },
    { header: "Company", key: "company", width: 25 },
    { header: "Job Description", key: "jobDescription", width: 30 },
    { header: "Job Link", key: "jobLink", width: 30 },
    { header: "Role", key: "roleTitle", width: 30 },
    { header: "Job Type", key: "jobType", width: 15 },
    { header: "Salary", key: "salary", width: 15 },
    { header: "Location", key: "location", width: 20 },
    { header: "Work Schedule", key: "workSchedule", width: 20 },
    { header: "Work Setup", key: "workSetup", width: 15 },
    { header: "Application Method", key: "applicationMethod", width: 20 },
    { header: "CV", key: "cvId", width: 20 },
    { header: "Cover Letter", key: "coverLetterId", width: 20 },
    { header: "Applied Date", key: "applicationDate", width: 18 },
    { header: "Status", key: "status", width: 15 },
    ...interviewColumns,
    { header: "Priority", key: "priority", width: 15 },
    { header: "Notes", key: "notes", width: 30 },
  ];

  // Don't include header here or ExcelJS creates a duplicate header row.
  worksheet.columns = columns.map(({ key, width }) => ({
    key,
    width,
  }));

  // =====================================
  // Title
  // =====================================

  worksheet.mergeCells(1, 1, 1, columns.length);

  const titleCell = worksheet.getCell("A1");

  titleCell.value = "Job Applications Report";

  titleCell.font = {
    size: 18,
    bold: true,
  };

  titleCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.getRow(1).height = 30;

  // =====================================
  // Summary
  // =====================================

  worksheet.getCell("A2").value = "Total Applications";
  worksheet.getCell("B2").value = jobs.length;

  worksheet.getCell("A2").font = {
    bold: true,
  };

  // =====================================
  // Header Row
  // =====================================

  const headerRow = worksheet.getRow(4);

  headerRow.values = columns.map((column) => column.header);

  headerRow.height = 22;

  headerRow.font = {
    bold: true,
    color: {
      argb: "FFFFFFFF",
    },
  };

  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "2563EB",
    },
  };

  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  // =====================================
  // Data Rows
  // =====================================

  jobs.forEach((job, index) => {
    const rowData: Record<string, unknown> = {
      number: index + 1,
      company: job.company,
      jobDescription: job.jobDescription,
      jobLink: job.jobLink,
      roleTitle: job.roleTitle,
      jobType: job.jobType,
      salary: job.salary,
      location: job.location,
      workSchedule: job.workSchedule,
      workSetup: job.workSetup,
      applicationMethod: job.applicationMethod,
      cvId: job.cv?.name,
      coverLetterId: job.coverLetter?.name,
      applicationDate: job.applicationDate
        ? new Date(job.applicationDate).toLocaleDateString()
        : "",
      status: job.status,
    };

    job.interviewStages?.forEach((stage, stageIndex) => {
      rowData[`stage${stageIndex + 1}`] = [
        `Type: ${stage.interviewType}`,
        stage.interviewDate
          ? `Date: ${new Date(stage.interviewDate).toLocaleDateString()}`
          : "",
        stage.interviewTime ? `Time: ${stage.interviewTime}` : "",
        stage.interviewerName ? `Interviewer: ${stage.interviewerName}` : "",
        stage.interviewComment ? `Comment: ${stage.interviewComment}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    });

    rowData.priority = job.priority;
    rowData.notes = job.notes;
    const row = worksheet.addRow(rowData);

    row.eachCell((cell) => {
      cell.alignment = {
        wrapText: true,
        vertical: "top",
      };
    });

    // Alternate row colors
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "F8FAFC",
          },
        };
      });
    }
  });

  // =====================================
  // Borders
  // =====================================

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 4) return;

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // =====================================
  // Auto Filter
  // =====================================

  worksheet.autoFilter = {
    from: {
      row: 4,
      column: 1,
    },
    to: {
      row: 4,
      column: columns.length,
    },
  };

  // =====================================
  // Freeze Header
  // =====================================

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 4,
    },
  ];

  // =====================================
  // Download
  // =====================================

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `job-applications-${
    new Date().toISOString().split("T")[0]
  }.xlsx`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
