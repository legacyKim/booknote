const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const {
  uploadFileToFolder,
  getFilesFromFolder,
  downloadAllFilesFromFolder,
  downloadFile,
} = require("./googleDrive");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// txt 파일들이 있는 폴더
const fileFolderPath = path.join(__dirname, "file");
const taskFolderPath = path.join(__dirname, "task");

// 파일 목록 API
app.get("/api/files", (req, res) => {
  fs.readdir(fileFolderPath, (err, files) => {
    if (err) return res.status(500).send("Error reading directory");
    const txtFiles = files.filter((file) => file.endsWith(".txt"));
    res.json(txtFiles);
  });
});

// 각 파일 내용 가져오기
app.get("/api/file/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(fileFolderPath, filename);
  if (!filePath.startsWith(fileFolderPath)) {
    return res.status(400).send("Invalid file path");
  }
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(404).send("File not found");
    res.send(data);
  });
});

app.post("/api/file", (req, res) => {
  const { bookName, author, content } = req.body;

  if (!bookName || !author) {
    return res.status(400).send("bookName, author는 필수입니다.");
  }

  const filePath = path.join(fileFolderPath, `${bookName}.txt`);

  // JSON 문자열로 저장
  const fileData = JSON.stringify({ author, content }, null, 2);

  fs.writeFile(filePath, fileData, "utf8", (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("파일 저장 중 오류 발생");
    }
    res.status(201).send("파일 저장 완료");
  });
});

app.put("/api/file/:filename/rename", (req, res) => {
  const { filename } = req.params;
  const newName = req.body.newBookName;

  if (!newName) return res.status(400).send("새 이름이 필요합니다.");

  const oldPath = path.join(fileFolderPath, filename);
  const newPath = path.join(fileFolderPath, `${newName}.txt`);

  fs.rename(oldPath, newPath, (err) => {
    if (err) return res.status(500).send("이름 변경 중 오류 발생");
    res.status(200).send("이름 변경 완료");
  });
});

app.put("/api/file/:filename/authorName", (req, res) => {
  const { filename } = req.params;
  const { newAuthorName } = req.body;
  const filePath = path.join(fileFolderPath, filename);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(404).send("File not found");

    let parsed = JSON.parse(data);
    parsed.author = newAuthorName;

    fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf8", (err) => {
      if (err) return res.status(500).send("Error saving file");
      res.status(200).send("Updated");
    });
  });
});

app.post("/api/file/:filename/memo", (req, res) => {
  const { filename } = req.params;
  const { memoIndex, memo, page, opinionList } = req.body;

  if (!memo || !page) {
    return res.status(400).send("memo와 page는 필수입니다.");
  }

  const filePath = path.join(fileFolderPath, filename);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(404).send("파일을 찾을 수 없습니다.");

    try {
      const json = JSON.parse(data);

      if (!Array.isArray(json.content)) {
        return res.status(400).send("content는 배열이어야 합니다.");
      }

      json.content.push({ memoIndex, memo, page, opinionList });

      fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf8", (err) => {
        if (err) return res.status(500).send("파일 저장 중 오류 발생");
        res.status(200).send("메모 추가 완료");
      });
    } catch (e) {
      console.error(e);
      res.status(500).send("파일 파싱 중 오류 발생");
    }
  });
});

app.delete("/api/file/:filename/memo/:index", (req, res) => {
  const { filename, index } = req.params;
  const filePath = path.join(fileFolderPath, filename);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(404).send("File not found");

    let parsed = JSON.parse(data);
    parsed.content.splice(index, 1);

    fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf8", (err) => {
      if (err) return res.status(500).send("Error saving file");
      res.status(200).send("Deleted");
    });
  });
});

app.put("/api/file/:filename/memo/:index", (req, res) => {
  const { filename, index } = req.params;
  const { memoIndex, memo, page, opinionList } = req.body;
  const filePath = path.join(fileFolderPath, filename);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(404).send("File not found");

    let parsed = JSON.parse(data);
    parsed.content[index] = { memoIndex, memo, page, opinionList };

    fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf8", (err) => {
      if (err) return res.status(500).send("Error saving file");
      res.status(200).send("Updated");
    });
  });
});

app.post("/api/file/:filename/opinion/:index", (req, res) => {
  const { filename, index } = req.params;
  const { opinion } = req.body;

  if (!opinion) {
    return res.status(400).json({ error: "의견 내용이 없습니다." });
  }

  const filePath = path.join(fileFolderPath, filename);

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("파일 읽기 실패:", err);
      return res.status(500).json({ error: "파일을 읽을 수 없습니다." });
    }

    try {
      const json = JSON.parse(data);
      const targetMemo = json.content[parseInt(index)];

      if (!targetMemo) {
        return res
          .status(404)
          .json({ error: "해당 인덱스의 메모를 찾을 수 없습니다." });
      }

      targetMemo.opinionList.push({
        opinion,
      });

      fs.writeFile(filePath, JSON.stringify(json, null, 2), (err) => {
        if (err) {
          console.error("파일 쓰기 실패:", err);
          return res.status(500).json({ error: "파일 저장에 실패했습니다." });
        }

        res.status(200).json({ message: "의견이 추가되었습니다." });
      });
    } catch (e) {
      console.error("JSON 파싱 오류:", e);
      return res.status(500).json({ error: "JSON 파싱 오류" });
    }
  });
});

app.put("/api/file/:filename/opinion/:memoIndex/:opinionIndex", (req, res) => {
  const { filename, memoIndex, opinionIndex } = req.params;
  const { opinion } = req.body;

  if (!opinion) {
    return res.status(400).json({ error: "의견 내용이 없습니다." });
  }

  const filePath = path.join(fileFolderPath, filename);

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("파일 읽기 실패:", err);
      return res.status(500).json({ error: "파일을 읽을 수 없습니다." });
    }

    try {
      const json = JSON.parse(data);
      const memo = json.content[parseInt(memoIndex)];

      if (!memo) {
        return res.status(404).json({ error: "해당 메모를 찾을 수 없습니다." });
      }

      if (!memo.opinionList || !memo.opinionList[opinionIndex]) {
        return res.status(404).json({ error: "해당 의견을 찾을 수 없습니다." });
      }

      memo.opinionList[opinionIndex].opinion = opinion;

      fs.writeFile(filePath, JSON.stringify(json, null, 2), (err) => {
        if (err) {
          console.error("파일 쓰기 실패:", err);
          return res.status(500).json({ error: "파일 저장에 실패했습니다." });
        }

        res.status(200).json({ message: "의견이 수정되었습니다." });
      });
    } catch (e) {
      console.error("JSON 파싱 오류:", e);
      return res.status(500).json({ error: "JSON 파싱 오류" });
    }
  });
});

app.delete(
  "/api/file/:filename/opinion/:memoIndex/:opinionIndex",
  (req, res) => {
    const { filename, memoIndex, opinionIndex } = req.params;
    const filePath = path.join(fileFolderPath, filename);

    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        console.error("파일 읽기 실패:", err);
        return res.status(500).json({ error: "파일을 읽을 수 없습니다." });
      }

      try {
        const json = JSON.parse(data);
        const memo = json.content[parseInt(memoIndex)];

        if (!memo) {
          return res
            .status(404)
            .json({ error: "해당 메모를 찾을 수 없습니다." });
        }

        if (!memo.opinionList || !memo.opinionList[opinionIndex]) {
          return res
            .status(404)
            .json({ error: "해당 의견을 찾을 수 없습니다." });
        }

        // 해당 opinion 삭제
        memo.opinionList.splice(opinionIndex, 1);

        fs.writeFile(filePath, JSON.stringify(json, null, 2), (err) => {
          if (err) {
            console.error("파일 쓰기 실패:", err);
            return res.status(500).json({ error: "파일 저장에 실패했습니다." });
          }

          res.status(200).json({ message: "의견이 삭제되었습니다." });
        });
      } catch (e) {
        console.error("JSON 파싱 오류:", e);
        return res.status(500).json({ error: "JSON 파싱 오류" });
      }
    });
  },
);

app.get("/api/search", (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).send("검색어가 필요합니다.");

  fs.readdir(fileFolderPath, (err, files) => {
    if (err) return res.status(500).send("폴더를 읽을 수 없습니다.");

    const txtFiles = files.filter((f) => f.endsWith(".txt"));
    const result = [];

    let remaining = txtFiles.length;
    if (remaining === 0) return res.status(200).json({ result: [] });

    txtFiles.forEach((file) => {
      const filePath = path.join(fileFolderPath, file);
      fs.readFile(filePath, "utf8", (err, data) => {
        if (!err) {
          try {
            const parsed = JSON.parse(data);
            const matched = parsed.content?.filter((item) =>
              item.memo.includes(q),
            );

            if (matched?.length > 0) {
              result.push({
                fileName: file,
                bookName: parsed.bookName,
                author: parsed.author,
                matches: matched,
              });
            }
          } catch (e) {
            console.error(`${file} 파싱 오류:`, e);
          }
        }

        remaining--;
        if (remaining === 0) {
          res.status(200).json({ result });
        }
      });
    });
  });
});

// 작업 목록 API
app.get("/api/task", (req, res) => {
  fs.readdir(taskFolderPath, (err, tasks) => {
    if (err) return res.status(500).send("Error reading directory");
    const txtFiles = tasks.filter((task) => task.endsWith(".txt"));
    res.json(txtFiles);
  });
});

app.get("/api/task/:taskname", (req, res) => {
  const { taskname } = req.params;
  const taskPath = path.join(taskFolderPath, taskname);
  if (!taskPath.startsWith(taskFolderPath)) {
    return res.status(400).send("Invalid file path");
  }
  fs.readFile(taskPath, "utf8", (err, data) => {
    if (err) return res.status(404).send("File not found");
    res.send(data);
  });
});

app.put("/api/task/:taskname", (req, res) => {
  const { taskname } = req.params;
  const { topic, content } = req.body;

  if (!topic || !content) {
    return res.status(400).send("Both topic and content are required.");
  }

  const taskPath = path.join(taskFolderPath, taskname);
  if (!taskPath.startsWith(taskFolderPath)) {
    return res.status(400).send("Invalid file path");
  }

  const fileContent = JSON.stringify({ topic, content }, null, 2); // 예쁘게 저장

  fs.writeFile(taskPath, fileContent, "utf8", (err) => {
    if (err) {
      console.error("파일 저장 실패:", err);
      return res.status(500).send("Failed to save file.");
    }
    res.status(200).send("File updated successfully.");
  });
});

app.post("/api/task", (req, res) => {
  const { topic, content } = req.body;

  if (!topic) {
    return res.status(400).send("topic은은 필수입니다.");
  }

  const taskPath = path.join(taskFolderPath, `${topic}.txt`);

  // JSON 문자열로 저장
  const fileData = JSON.stringify({ content }, null, 2);

  fs.writeFile(taskPath, fileData, "utf8", (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("파일 저장 중 오류 발생");
    }
    res.status(201).send("파일 저장 완료");
  });
});

// Google Drive 업로드 API
app.post("/api/upload-file/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const { folderType } = req.body; // 클라이언트에서 지정한 폴더 타입
    let filePath;

    // 클라이언트가 지정한 폴더 타입에 따라 경로 결정
    if (folderType === "file") {
      filePath = path.join(fileFolderPath, filename);
    } else if (folderType === "task") {
      filePath = path.join(taskFolderPath, filename);
    } else {
      return res
        .status(400)
        .json({ error: "올바른 폴더 타입을 지정해주세요 (file 또는 task)" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "파일을 찾을 수 없습니다." });
    }

    const result = await uploadFileToFolder(filePath, filename, folderType);
    res.json({
      success: true,
      message: `파일이 Google Drive의 ${folderType} 폴더에 업로드되었습니다.`,
      fileId: result.id,
      folder: folderType,
    });
  } catch (error) {
    console.error("업로드 오류:", error);
    res.status(500).json({
      error: "업로드 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 🚀 NEW: 구글 드라이브 다운로드 API들

// 구글 드라이브 폴더의 파일 목록 조회
app.get("/api/drive/:folderName/files", async (req, res) => {
  const { folderName } = req.params;

  if (folderName !== "file" && folderName !== "task") {
    return res.status(400).json({ error: "file 또는 task 폴더만 지원됩니다." });
  }

  try {
    const files = await getFilesFromFolder(folderName);
    res.json({
      folderName,
      files,
      count: files.length,
    });
  } catch (error) {
    console.error(`${folderName} 폴더 목록 조회 오류:`, error);
    res.status(500).json({
      error: "폴더 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 특정 폴더의 모든 파일 다운로드
app.post("/api/drive/:folderName/download-all", async (req, res) => {
  const { folderName } = req.params;

  if (folderName !== "file" && folderName !== "task") {
    return res.status(400).json({ error: "file 또는 task 폴더만 지원됩니다." });
  }

  try {
    const result = await downloadAllFilesFromFolder(folderName);
    res.json({
      message: `${folderName} 폴더 다운로드 완료`,
      ...result,
    });
  } catch (error) {
    console.error(`${folderName} 폴더 다운로드 오류:`, error);
    res.status(500).json({
      error: "폴더 다운로드 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 특정 파일 다운로드 (서버에 저장하고 브라우저에도 다운로드)
app.get("/api/drive/download-file/:fileId/:fileName", async (req, res) => {
  const { fileId, fileName } = req.params;
  const folderType = req.query.folderType || "file"; // file 또는 task

  try {
    const auth = require("./googleDrive").authorize();
    const { google } = require("googleapis");
    const drive = google.drive({ version: "v3", auth });

    // 파일 메타데이터 가져오기
    const fileInfo = await drive.files.get({
      fileId: fileId,
      fields: "name, size, mimeType",
    });

    // 파일 내용 가져오기
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      {
        responseType: "stream",
      },
    );

    // 파일 경로 결정 로직
    const fileFolder = folderType === "task" ? "task" : "file";
    const targetPath = path.join(__dirname, fileFolder, fileName);
    const downloadPath = path.join(__dirname, "download", fileName);

    let finalPath = targetPath;

    // 같은 이름의 파일이 이미 존재하는지 확인
    if (fs.existsSync(targetPath)) {
      // file/task 폴더에 같은 파일이 있으면 download 폴더에 저장
      finalPath = downloadPath;

      // download 폴더가 없으면 생성
      const downloadDir = path.dirname(downloadPath);
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }
    }

    // 파일을 서버에 저장
    const writeStream = fs.createWriteStream(finalPath);

    let savedSuccessfully = false;

    return new Promise((resolve, reject) => {
      response.data.pipe(writeStream);

      writeStream.on("finish", () => {
        savedSuccessfully = true;

        // 브라우저 다운로드를 위한 헤더 설정
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        );

        if (fileInfo.data.size) {
          res.setHeader("Content-Length", fileInfo.data.size);
        }

        // 저장된 파일을 브라우저로 전송
        const readStream = fs.createReadStream(finalPath);
        readStream.pipe(res);

        resolve();
      });

      writeStream.on("error", (error) => {
        console.error("파일 저장 오류:", error);
        reject(error);
      });

      response.data.on("error", (error) => {
        console.error("파일 다운로드 오류:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error("파일 다운로드 오류:", error);
    res.status(500).json({
      error: "파일 다운로드 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 특정 파일 다운로드 (기존 방식 - 서버에 저장)
app.post("/api/drive/download-file", async (req, res) => {
  const { fileId, fileName, folderName } = req.body;

  if (!fileId || !fileName) {
    return res.status(400).json({ error: "fileId와 fileName이 필요합니다." });
  }

  try {
    const downloadPath = path.join(__dirname, "download", folderName || "misc");
    const result = await downloadFile(fileId, fileName, downloadPath);

    res.json({
      message: "파일 다운로드 완료",
      ...result,
    });
  } catch (error) {
    console.error("파일 다운로드 오류:", error);
    res.status(500).json({
      error: "파일 다운로드 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
