import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export type tFileName = {
  searchOn: boolean;
  setNewFiles: React.Dispatch<React.SetStateAction<boolean>>;
  searchResMemo: string;
  bookListClose: boolean;
  taskListClose: boolean;
  memoBoxOn: boolean;
  setMemoBoxOn: React.Dispatch<React.SetStateAction<boolean>>;
};

export type Memo = {
  memoIndex: string;
  memo: string;
  page: string;
  opinionList: { opinion: string }[];
};

export type tFileContent = {
  author: string;
  content: Memo[];
};

export default function FileView({
  searchOn,
  setNewFiles,
  searchResMemo,
  bookListClose,
  taskListClose,
  memoBoxOn,
  setMemoBoxOn,
}: tFileName) {
  const { filename } = useParams();
  const navigate = useNavigate();

  const [filenameInView, setFileNameInView] = useState<string>();
  const [newJsonData, setNewJsonData] = useState<boolean>(true);

  const [jsonData, setJsonData] = useState<tFileContent | null>(null);

  // Opinion 팝업 관련 상태
  const [opinionPopOn, setOpinionPopOn] = useState<boolean>(false);
  const [expandedMemos, setExpandedMemos] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (filename !== filenameInView || newJsonData) {
      fetch(`http://localhost:3001/api/file/${filename}`)
        .then((res) => res.json())
        .then((data) => {
          setJsonData(data);
          setNewJsonData(false);
        })
        .catch((err) => {
          console.error(err);
          setNewJsonData(false);
        });
    }

    setBookName(filename?.replace(/\.txt$/, ""));
    setBookNameChg(false);

    setAuthorName(jsonData?.author);
    setAuthorChg(false);

    // 이전 목록 확인
    setFileNameInView(filename);

    setEditIndex(null);
  }, [filename, newJsonData, jsonData]);

  const [memo, setMemo] = useState("");
  const [page, setPage] = useState("");

  const memoAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMemo: Memo = { memoIndex, memo, page, opinionList: [] };

    if (memoIndex === "") {
      alert("목차를 입력해 주세요.");
      memoIndexRef.current?.focus();
      return;
    }

    if (memo === "") {
      alert("메모를 입력해 주세요.");
      memoTextareaRef.current?.focus();
      return;
    }

    if (page === "") {
      alert("쪽수를 입력해 주세요.");
      pageRef.current?.focus();
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3001/api/file/${filename}/memo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMemo),
        }
      );

      if (!res.ok) throw new Error("메모 추가 실패");

      setMemo("");
      setPage("");
      setNewJsonData(true);

      alert("메모가 추가되었습니다!");
      memoTextareaRef.current?.focus();
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  };

  const memoDeleteAlert = (index: number) => {
    if (window.confirm("메모를 삭제하시겠습니까?")) {
      memoDelete(index);
    }
  };

  const memoDelete = async (index: number) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/file/${filename}/memo/${index}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("삭제 실패");

      // 삭제 후 다시 불러오기
      const updated = await fetch(`http://localhost:3001/api/file/${filename}`);
      const data = await updated.json();
      setJsonData(data);
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류 발생");
    }
  };

  // memo edit
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editMemo, setEditMemo] = useState("");
  const [editPage, setEditPage] = useState("");
  const [opinionDefault, setOpinionDefault] = useState([{}]);

  const edit = (index: number) => {
    const target = jsonData?.content[index];
    if (!target) return;

    setEditIndex(index);
    setEditMemo(target.memo);
    setEditPage(target.page);
    setEditMemoIndex(target.memoIndex);
    setOpinionDefault(target.opinionList);
  };

  const memoEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editIndex === null) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/file/${filename}/memo/${editIndex}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memoIndex: editMemoIndex,
            memo: editMemo,
            page: editPage,
            opinionList: opinionDefault,
          }),
        }
      );

      if (!res.ok) throw new Error("수정 실패");

      const updated = await fetch(`http://localhost:3001/api/file/${filename}`);
      const data = await updated.json();
      setJsonData(data);
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류 발생");
    }
  };

  // memo edit position
  const memoEditRef = useRef<HTMLDivElement>(null);
  const memoListRef = useRef<HTMLUListElement>(null);
  const [formStyle, setFormStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const memoContentRef = useRef<HTMLParagraphElement>(null);
  const [conStyle, setConStyle] = useState({
    height: 0,
  });

  useEffect(() => {
    if (
      editIndex !== null &&
      memoEditRef.current &&
      memoContentRef.current &&
      memoListRef.current
    ) {
      const ulRect = memoListRef.current.getBoundingClientRect();
      const rect = memoEditRef.current.getBoundingClientRect();
      setFormStyle({
        top: rect.top - ulRect.top + 1,
        left: rect.left - ulRect.left + 1,
        width: rect.width - 2,
        height: rect.height - 2,
      });

      const conRect = memoContentRef.current.getBoundingClientRect();
      setConStyle({
        height: conRect.height,
      });
    }

    // scroll
    const editScroll = () => {
      if (editIndex !== null) {
        setEditIndex(null);
      }
    };

    window.addEventListener("scroll", editScroll);

    return () => {
      window.removeEventListener("scroll", editScroll);
    };
  }, [editIndex]);

  // bookname change
  const [bookName, setBookName] = useState<string>();

  const [bookNameChg, setBookNameChg] = useState<boolean>(false);
  const [newBookName, setNewBookName] = useState<string>();
  const bookInputRef = useRef<HTMLInputElement>(null);

  const bookNameChgBtn = async () => {
    const res = await fetch(
      `http://localhost:3001/api/file/${filename}/rename`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBookName }),
      }
    );

    if (!res.ok) {
      alert("파일 이름 변경 실패");
      return;
    }

    alert("파일 이름이 변경되었습니다.");
    setNewFiles(true);
    setBookNameChg(false);
    setBookName(newBookName);

    navigate(`/file/${newBookName}.txt`);
  };

  useEffect(() => {
    bookInputRef.current?.focus();
  }, [bookNameChg]);

  const [authorName, setAuthorName] = useState<string>();
  const [authorChg, setAuthorChg] = useState<boolean>(false);
  const [newAuthorName, setNewAuthorName] = useState<string>();
  const authorInputRef = useRef<HTMLInputElement>(null);

  const authorChgBtn = async () => {
    const res = await fetch(
      `http://localhost:3001/api/file/${filename}/authorName`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newAuthorName }),
      }
    );

    if (!res.ok) {
      alert("저자 이름 변경 실패");
      return;
    }

    alert("저자 이름이 변경되었습니다.");
    setNewFiles(true);
    setAuthorChg(false);
    setAuthorName(newAuthorName);
  };

  useEffect(() => {
    authorInputRef.current?.focus();
  }, [authorChg]);

  // memo textarea height
  const [memoIndex, setMemoIndex] = useState<string>("");
  const memoIndexRef = useRef<HTMLInputElement>(null);
  const memoTextareaRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLInputElement>(null);

  const memoTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);

    if (memoTextareaRef.current) {
      memoTextareaRef.current.style.height = "auto"; // 높이 초기화
      memoTextareaRef.current.style.height = `${memoTextareaRef.current.scrollHeight}px`; // 내용만큼 높이 설정
    }
  };

  useEffect(() => {
    if (memoTextareaRef.current) {
      memoTextareaRef.current.style.height = "auto";
      memoTextareaRef.current.style.height = `${memoTextareaRef.current.scrollHeight}px`;
    }
  }, [memo]);

  // edit textarea height
  const memoIndexEditRef = useRef<HTMLInputElement>(null);
  const [editMemoIndex, setEditMemoIndex] = useState<string>("");

  const editMemoTextareaRef = useRef<HTMLTextAreaElement>(null);
  const memoEditFormRef = useRef<HTMLFormElement>(null);

  const memoEditTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditMemo(e.target.value);

    if (
      editMemoTextareaRef.current &&
      memoEditFormRef.current &&
      memoEditRef.current &&
      memoIndexEditRef.current
    ) {
      editMemoTextareaRef.current.style.height = "auto"; // 높이 초기화
      editMemoTextareaRef.current.style.height = `${editMemoTextareaRef.current.scrollHeight}px`;

      memoEditFormRef.current.style.height = "auto"; // 높이 초기화
      memoEditFormRef.current.style.height = `${
        editMemoTextareaRef.current.scrollHeight +
        41.2 +
        memoIndexEditRef.current.height
      }px`;

      memoEditRef.current.style.height = "auto"; // 높이 초기화
      memoEditRef.current.style.height = `${
        editMemoTextareaRef.current.scrollHeight +
        41.2 +
        memoIndexEditRef.current.height
      }px`;
    }
  };

  useEffect(() => {
    if (
      editMemoTextareaRef.current &&
      memoEditFormRef.current &&
      memoEditRef.current &&
      memoIndexEditRef.current
    ) {
      editMemoTextareaRef.current.style.height = "auto";
      editMemoTextareaRef.current.style.height = `${editMemoTextareaRef.current.scrollHeight}px`;

      memoEditFormRef.current.style.height = "auto";
      memoEditFormRef.current.style.height = `${
        editMemoTextareaRef.current.scrollHeight +
        41.2 +
        memoIndexEditRef.current.height
      }px`;

      memoEditRef.current.style.height = "auto";
      memoEditRef.current.style.height = `${
        editMemoTextareaRef.current.scrollHeight +
        41.2 +
        memoIndexEditRef.current.height
      }px`;
    }
  }, [memo]);

  // sort
  const [sortList, setSortList] = useState<string>("downward");

  // opinion
  const [myOpinion, setMyOpinion] = useState<string>("");
  const [opinionListOpen, setOpinionListOpen] = useState<number | null>(null);

  const [opinionTextareaOpen, setOpinionTextareaOpen] =
    useState<boolean>(false);

  const opinionPost = async (index: number) => {
    const opinion = myOpinion;
    try {
      const res = await fetch(
        `http://localhost:3001/api/file/${filename}/opinion/${index}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opinion: opinion,
          }),
        }
      );

      if (!res.ok) throw new Error("수정 실패");

      const updated = await fetch(`http://localhost:3001/api/file/${filename}`);
      const data = await updated.json();
      setJsonData(data);
      setOpinionTextareaOpen(false);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류 발생");
    }
  };

  const [myOpinionCorr, setMyOpinionCorr] = useState<string>("");
  const [myOpIdx, setMyOpIdx] = useState<number | null>(null);

  const opinionCorr = async (
    memoIndex: number,
    opinionIndex: number | null
  ) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/file/${filename}/opinion/${memoIndex}/${opinionIndex}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opinion: myOpinionCorr }), // 수정된 내용
        }
      );

      if (!res.ok) throw new Error("의견 수정 실패");

      // 최신 데이터로 갱신
      const updated = await fetch(`http://localhost:3001/api/file/${filename}`);
      const data = await updated.json();
      setJsonData(data);

      setMyOpinionCorr("");
      setMyOpIdx(null);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류 발생");
    }
  };

  const myOpinionRef = useRef<HTMLTextAreaElement>(null);

  const myOpinionTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMyOpinion(e.target.value);

    if (myOpinionRef.current) {
      myOpinionRef.current.style.height = "auto"; // 높이 초기화
      myOpinionRef.current.style.height = `${
        myOpinionRef.current.scrollHeight - 28
      }px`;
    }
  };

  const myOpinionCorrRef = useRef<HTMLTextAreaElement>(null);

  const myOpinionCorrTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMyOpinionCorr(e.target.value);

    if (myOpinionCorrRef.current) {
      myOpinionCorrRef.current.style.height = "auto"; // 높이 초기화
      myOpinionCorrRef.current.style.height = `${
        myOpinionCorrRef.current.scrollHeight - 28
      }px`;
    }
  };

  // opinion delete

  const opinionDelteConfirm = (memoIndex: number, opinionIndex: number) => {
    const result = window.confirm("정말 삭제하시겠습니까?");

    if (result && opinionIndex !== null) {
      opinionDelete(memoIndex, opinionIndex);
    } else {
      return;
    }
  };

  const opinionDelete = async (memoIndex: number, opinionIndex: number) => {
    console.log(memoIndex, opinionIndex, " 왜?");

    try {
      const res = await fetch(
        `http://localhost:3001/api/file/${filename}/opinion/${memoIndex}/${opinionIndex}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("의견 삭제 실패");

      // 최신 데이터로 갱신
      const updated = await fetch(`http://localhost:3001/api/file/${filename}`);
      const data = await updated.json();
      setJsonData(data);
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류 발생");
    }
  };

  // Opinion 팝업 관련 함수들
  const getAllOpinions = () => {
    if (!jsonData) return [];

    const allOpinions: Array<{
      memoIndex: number;
      memoContent: string;
      opinion: string;
      page: string;
      memoIndexName: string;
    }> = [];

    jsonData.content.forEach((memo, memoIndex) => {
      memo.opinionList.forEach((op) => {
        allOpinions.push({
          memoIndex,
          memoContent: memo.memo,
          opinion: op.opinion,
          page: memo.page,
          memoIndexName: memo.memoIndex,
        });
      });
    });

    return allOpinions;
  };

  const toggleMemoExpansion = (memoIndex: number) => {
    setExpandedMemos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memoIndex)) {
        newSet.delete(memoIndex);
      } else {
        newSet.add(memoIndex);
      }
      return newSet;
    });
  };

  const scrollToMemo = (memoIndex: number) => {
    setOpinionPopOn(false);

    // 해당 메모로 스크롤
    setTimeout(() => {
      const memoElements = document.querySelectorAll(".memo_list li");
      const targetMemo = memoElements[memoIndex];
      if (targetMemo) {
        targetMemo.scrollIntoView({ behavior: "smooth", block: "center" });
        // 잠시 하이라이트 효과
        targetMemo.classList.add("highlight");
        setTimeout(() => {
          targetMemo.classList.remove("highlight");
        }, 2000);
      }
    }, 100);
  };

  // Google Drive 업로드
  const uploadToGoogleDrive = async () => {
    if (!filename) {
      alert("업로드할 파일이 없습니다.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/upload-file/${filename}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderType: "file" }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("파일이 Google Drive에 성공적으로 업로드되었습니다!");
      } else {
        alert(`업로드 실패: ${result.error || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={`content ${searchOn ? "searchOn" : ""}`}>
      <div className="top size_876">
        <div className="title">
          {!bookNameChg && (
            <div className="flex-box-sb">
              <h2 className="bookname">{bookName}</h2>
              <button
                type="button"
                className="btn_hover icon-feather"
                onClick={() => {
                  setBookNameChg(true);
                  setNewBookName(bookName);
                  bookInputRef.current?.focus();
                }}
                aria-label="bookname correct"
              ></button>
            </div>
          )}

          {bookNameChg && (
            <div className="flex-box-sb">
              <input
                type="text"
                ref={bookInputRef}
                value={newBookName}
                onChange={(e) => {
                  setNewBookName(e.target.value);
                }}
              />
              <div className="btn_wrap">
                <button
                  className="icon-ok"
                  type="button"
                  onClick={() => {
                    bookNameChgBtn();
                  }}
                  aria-label="ok"
                ></button>
                <button
                  className="icon-cancel"
                  type="button"
                  onClick={() => {
                    setBookNameChg(false);
                  }}
                  aria-label="cancel"
                ></button>
              </div>
            </div>
          )}
        </div>

        <div className="author">
          {!authorChg && (
            <div className="flex-box-sb">
              <span className="">{authorName}</span>

              <button
                type="button"
                className="btn_hover icon-feather"
                onClick={() => {
                  setAuthorChg(true);
                  setNewAuthorName(authorName);
                  authorInputRef.current?.focus();
                }}
                aria-label="author correct"
              ></button>
            </div>
          )}

          {authorChg && (
            <div>
              <div className="flex-box-sb">
                <input
                  type="text"
                  ref={authorInputRef}
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                />
                <div className="btn_wrap">
                  <button
                    type="button"
                    className="icon-ok"
                    onClick={() => {
                      authorChgBtn();
                    }}
                    aria-label="ok"
                  ></button>
                  <button
                    type="button"
                    className="icon-cancel"
                    onClick={() => {
                      setAuthorChg(false);
                    }}
                    aria-label="cancel"
                  ></button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Opinion 팝업 버튼 */}
        <div className="opinion_popup_btn">
          <button
            type="button"
            className="icon-th-list"
            onClick={() => setOpinionPopOn(true)}
            aria-label="view all opinions"
            title="모든 의견 보기"
          ></button>
        </div>
      </div>

      <div className={`${searchOn ? "searchOn" : ""} memo_list_box`}>
        <ul
          className={`memo_list size_876 ${sortList && `${sortList}`}`}
          ref={memoListRef}
        >
          {jsonData?.content.map((item, memoIdx) => (
            <li key={memoIdx}>
              <div
                ref={editIndex === memoIdx ? memoEditRef : null}
                className={`${searchResMemo === item.memo ? "active" : ""}`}
              >
                <span className="memo_index">{item.memoIndex}</span>
                <p
                  ref={editIndex === memoIdx ? memoContentRef : null}
                  className="memo_content"
                >
                  {item.memo}
                </p>
                <span className="memo_page">{item.page}p</span>
              </div>

              {opinionListOpen === memoIdx && (
                <div className="my_opinion">
                  <div className="my_opinion_add">
                    <div className="btn_wrap">
                      <button
                        className="icon-comment"
                        type="button"
                        onClick={() => {
                          setMyOpinion("");
                          setOpinionTextareaOpen(true);
                        }}
                      ></button>
                      <button
                        className="icon-cancel"
                        type="button"
                        onClick={() => {
                          setOpinionListOpen(null);
                        }}
                      ></button>
                    </div>

                    {opinionTextareaOpen && (
                      <div className="my_opinion_textarea">
                        <textarea
                          name="my_opinion_textarea"
                          value={myOpinion}
                          ref={myOpinionRef}
                          onChange={(e) => {
                            myOpinionTextareaChange(e);
                          }}
                        ></textarea>

                        <button
                          type="button"
                          className="icon-feather"
                          onClick={() => {
                            opinionPost(memoIdx);
                          }}
                        ></button>
                        <button
                          type="button"
                          className="icon-cancel"
                          onClick={() => {
                            setOpinionTextareaOpen(false);
                          }}
                        ></button>
                      </div>
                    )}
                  </div>

                  <ol className="opinion">
                    {item.opinionList.map((op, opIdx) => (
                      <li key={opIdx}>
                        <div className="op_content">
                          <p>{op.opinion}</p>
                          <div className="btn_wrap">
                            <button
                              type="button"
                              className="icon-feather"
                              onClick={() => {
                                setMyOpinionCorr(op.opinion);
                                setMyOpIdx(opIdx);
                              }}
                            ></button>

                            <button
                              type="button"
                              className="icon-trash"
                              onClick={() => {
                                opinionDelteConfirm(memoIdx, opIdx);
                              }}
                            ></button>
                          </div>
                        </div>
                        {myOpIdx === opIdx && (
                          <div className={`op_corr`}>
                            <textarea
                              name="opinion_textarea_corr"
                              value={myOpinionCorr}
                              ref={myOpinionCorrRef}
                              onChange={(e) => {
                                myOpinionCorrTextareaChange(e);
                              }}
                            ></textarea>
                            <button
                              type="button"
                              className="icon-ok"
                              onClick={() => {
                                opinionCorr(memoIdx, myOpIdx);
                              }}
                            ></button>
                            <button
                              type="button"
                              className="icon-cancel"
                              onClick={() => {
                                setMyOpIdx(null);
                              }}
                            ></button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="btn_wrap">
                <button className="icon-bookmark"></button>

                <button
                  className="icon-th-list"
                  onClick={() => {
                    setOpinionListOpen(memoIdx);
                  }}
                ></button>

                <button
                  className="icon-feather"
                  onClick={() => {
                    edit(memoIdx);
                  }}
                  aria-label="memo correct"
                ></button>

                <button
                  className="icon-trash"
                  onClick={() => {
                    memoDeleteAlert(memoIdx);
                  }}
                  aria-label="memo delete"
                ></button>
              </div>

              {item.opinionList.length !== 0 && (
                <div className="opinion_list_length">
                  {item.opinionList.length}
                </div>
              )}
            </li>
          ))}
          {editIndex !== null && editIndex !== undefined && (
            <form
              className="memo_edit"
              ref={memoEditFormRef}
              onSubmit={memoEdit}
              style={{
                top: `${formStyle.top - 1}px`,
                left: `${formStyle.left - 1}px`,
                width: `${formStyle.width - 48}px`,
                height: `${formStyle.height - 40}px`,
              }}
            >
              <input
                type="text"
                name="edit_memo_index"
                className="edit_memo_index"
                ref={memoIndexEditRef}
                value={editMemoIndex}
                onChange={(e) => {
                  setEditMemoIndex(e.target.value);
                }}
              />
              <textarea
                ref={editMemoTextareaRef}
                value={editMemo}
                style={{
                  height: `${conStyle.height}px`,
                }}
                onChange={(e) => memoEditTextareaChange(e)}
              ></textarea>
              <input
                value={editPage}
                onChange={(e) => setEditPage(e.target.value)}
              />
              <div className="btn_wrap">
                <button
                  type="submit"
                  className="icon-ok"
                  aria-label="memo edit"
                ></button>
                <button
                  className="icon-cancel"
                  onClick={() => {
                    if (
                      memoEditRef.current &&
                      memoContentRef.current &&
                      memoIndexEditRef.current
                    ) {
                      memoEditRef.current.style.height = "auto";
                      memoEditRef.current.style.height = `${
                        memoContentRef.current.getBoundingClientRect().height +
                        19.2 +
                        memoIndexEditRef.current.getBoundingClientRect().height
                      }px`;
                    }

                    setEditIndex(null);
                  }}
                  aria-label="memo edit cancel"
                ></button>
              </div>
            </form>
          )}
        </ul>
      </div>

      <form
        className={`memo_box size_876 ${bookListClose ? "on" : ""} ${
          taskListClose ? "task_on" : ""
        } ${memoBoxOn ? "active" : ""}`}
        onSubmit={memoAdd}
      >
        <input
          type="text"
          name="memo_index"
          value={memoIndex}
          placeholder="Index"
          ref={memoIndexRef}
          onChange={(e) => {
            setMemoIndex(e.target.value);
          }}
        />
        <textarea
          ref={memoTextareaRef}
          name="memo"
          value={memo}
          onChange={(e) => {
            memoTextareaChange(e);
          }}
          placeholder="Memo"
        ></textarea>
        <div className="page flex-box-fs">
          <span>page : </span>
          <input
            ref={pageRef}
            value={page}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, "");
              setPage(onlyNums);
            }}
          />
        </div>
        <button type="submit" className="submit-button" aria-label="memo add">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="#fff"
          >
            <path
              fillRule="evenodd"
              d="M4.293 9.707a1 1 0 0 1 1.414 0L9 13.586V3a1 1 0 1 1 2 0v10.586l3.293-3.879a1 1 0 1 1 1.414 1.414l-5 5.5a1 1 0 0 1-1.414 0l-5-5.5a1 1 0 0 1 0-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </form>

      <div className="memobox_on_off">
        <button
          className="icon-upload-cloud"
          type="button"
          onClick={uploadToGoogleDrive}
        ></button>
        <button
          className="icon-feather"
          type="button"
          onClick={() => {
            setMemoBoxOn(!memoBoxOn);
          }}
        ></button>
      </div>

      <div className="memo_sort">
        <button
          className="icon-sort-name-up"
          onClick={() => setSortList("upward")}
          aria-label="sort upward button"
        ></button>
        <button
          className="icon-sort-name-down"
          onClick={() => setSortList("downward")}
          aria-label="sort downward button"
        ></button>
      </div>

      {/* Opinion 팝업 모달 */}
      {opinionPopOn && (
        <div
          className="opinion_popup_overlay"
          onClick={() => setOpinionPopOn(false)}
        >
          <div
            className="opinion_popup_modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="opinion_popup_content">
              {getAllOpinions().length === 0 ? (
                <p className="no_opinions">아직 작성된 의견이 없습니다.</p>
              ) : (
                <ul className="opinion_list">
                  {getAllOpinions().map((item, index) => (
                    <li key={index} className="opinion_item">
                      <div className="opinion_header">
                        <div className="opinion_info">
                          <span className="opinion_page">{item.page}p</span>
                          <span className="opinion_memo_index">
                            {item.memoIndexName}
                          </span>
                        </div>
                        <div className="opinion_actions">
                          <button
                            type="button"
                            className="go_to_memo_btn"
                            onClick={() => scrollToMemo(item.memoIndex)}
                            title="메모로 이동"
                          >
                            <span className="icon-feather"></span>
                          </button>
                        </div>
                      </div>

                      <div className="opinion_content">
                        <p
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMemoExpansion(index);
                          }}
                        >
                          {item.opinion}
                        </p>
                      </div>

                      <div
                        className={`memo_content_toggle ${
                          expandedMemos.has(index) ? "expanded" : ""
                        }`}
                      >
                        <div className="memo_content_inner">
                          <p>{item.memoContent}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
