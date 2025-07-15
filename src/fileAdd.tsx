import { useState, useEffect } from "react";

type tFileAdd = {
  setNewFiles: React.Dispatch<React.SetStateAction<boolean>>;
  fileAdd: boolean;
  setFileAdd: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function FileAdd({
  setNewFiles,
  fileAdd,
  setFileAdd,
}: tFileAdd) {
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");

  const fileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bookName === "") {
      alert("책 제목을 입력해 주세요.");
      return;
    }

    if (author === "") {
      alert("저자를 입력해 주세요.");
      return;
    }

    const newContent = {
      bookName,
      author,
      content: [],
    };

    try {
      const res = await fetch("http://localhost:3001/api/file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContent),
      });

      if (!res.ok) throw new Error("Failed to save file");

      setBookName("");
      setAuthor("");

      setNewFiles(true);
      setFileAdd(false);

      alert("파일이 저장되었습니다!");
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className={`popup fixed ${fileAdd ? "fixed_show" : ""}`}>
      <form
        onSubmit={fileSubmit}
        className={`${fileAdd ? "transform_top" : ""}`}
      >
        <span>FILE SAVE</span>
        <div className="input_box">
          <label>Book name</label>
          <input
            type="text"
            value={bookName}
            onChange={(e) => {
              const value = e.target.value;
              const filtered = value.replace(
                /[^\p{Script=Hangul}a-zA-Z0-9\s]/gu,
                ""
              );
              setBookName(filtered);
            }}
            className="border p-1 ml-2"
          />
        </div>
        <div className="input_box">
          <label>Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => {
              const value = e.target.value;
              const filtered = value.replace(
                /[^\p{Script=Hangul}a-zA-Z0-9\s]/gu,
                ""
              );

              setAuthor(filtered);
            }}
          />
        </div>

        <button type="submit" className="save_btn" aria-label="save">
          Save
        </button>
        <button
          type="button"
          className="cancel_btn"
          onClick={() => {
            setFileAdd(false);
          }}
          aria-label="cancel"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
