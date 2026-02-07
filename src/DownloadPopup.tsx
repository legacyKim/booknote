import { useState, useEffect } from "react";
import "./css/DownloadPopup.css";

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size: string;
}

interface DownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadPopup({ isOpen, onClose }: DownloadPopupProps) {
  const [activeTab, setActiveTab] = useState<"file" | "task">("file");
  const [fileList, setFileList] = useState<DriveFile[]>([]);
  const [taskList, setTaskList] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string[]>([]);

  // 팝업이 열릴 때 파일 목록 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchFileList("file");
      fetchFileList("task");
    }
  }, [isOpen]);

  const fetchFileList = async (folderName: "file" | "task") => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/drive/${folderName}/files`,
      );
      const data = await response.json();

      if (folderName === "file") {
        setFileList(data.files || []);
      } else {
        setTaskList(data.files || []);
      }
    } catch (error) {
      console.error(`${folderName} 폴더 목록 가져오기 실패:`, error);
      alert(`${folderName} 폴더 목록을 가져오는데 실패했습니다.`);
    }
    setLoading(false);
  };

  const downloadFile = async (file: DriveFile, folderName: string) => {
    const fileKey = `${folderName}-${file.id}`;

    if (downloading.includes(fileKey)) return;

    setDownloading((prev) => [...prev, fileKey]);

    try {
      // 서버에 저장하면서 브라우저 다운로드도 실행
      const downloadUrl = `http://localhost:3001/api/drive/download-file/${file.id}/${encodeURIComponent(file.name)}?folderType=${folderName}`;

      // 새 창에서 다운로드 링크 열기
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 성공 메시지
      setTimeout(() => {
        alert(`✅ ${file.name} 다운로드를 시작했습니다.`);
      }, 100);
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }

    // 다운로드 상태 해제 (즉시)
    setTimeout(() => {
      setDownloading((prev) => prev.filter((key) => key !== fileKey));
    }, 1000);
  };

  const formatFileSize = (size: string) => {
    const bytes = parseInt(size);
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("ko-KR") +
      " " +
      date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  if (!isOpen) return null;

  const currentList = activeTab === "file" ? fileList : taskList;

  return (
    <div className="download-popup-overlay" onClick={onClose}>
      <div className="download-popup" onClick={(e) => e.stopPropagation()}>
        <div className="download-popup-header">
          <h2>구글 드라이브 다운로드</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="download-tabs">
          <button
            className={`tab-btn ${activeTab === "file" ? "active" : ""}`}
            onClick={() => setActiveTab("file")}
          >
            File ({fileList.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "task" ? "active" : ""}`}
            onClick={() => setActiveTab("task")}
          >
            Task ({taskList.length})
          </button>
        </div>

        <div className="file-list-container">
          {loading ? (
            <div className="loading">🔄 로딩중...</div>
          ) : currentList.length === 0 ? (
            <div className="empty">📂 폴더가 비어있습니다.</div>
          ) : (
            <div className="file-list">
              {currentList.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-name">📄 {file.name}</div>
                    <div className="file-meta">
                      {formatFileSize(file.size)} ·{" "}
                      {formatDate(file.modifiedTime)}
                    </div>
                  </div>
                  <button
                    className={`${
                      downloading.includes(`${activeTab}-${file.id}`)
                        ? "icon-spin3"
                        : "icon-download-cloud"
                    }`}
                    onClick={() => downloadFile(file, activeTab)}
                    disabled={downloading.includes(`${activeTab}-${file.id}`)}
                  ></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
