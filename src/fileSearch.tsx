import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type tFileSearch = {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  setSearchResult: React.Dispatch<React.SetStateAction<any[]>>;
  searchOn: boolean;
  setSearchOn: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Search({
  searchText,
  setSearchText,
  setSearchResult,
  searchOn,
  setSearchOn,
}: tFileSearch) {
  const navigate = useNavigate();

  const [show, setShow] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null); // ✅ input에 ref 연결

  const searchBtn = async () => {
    if (!searchText.trim()) return alert("검색어를 입력해주세요.");

    try {
      const res = await fetch(
        `http://localhost:3001/api/search?q=${encodeURIComponent(searchText)}`
      );
      if (!res.ok) throw new Error("검색 실패");

      const data = await res.json();
      setSearchResult(data.result);
      navigate(`/search`);
    } catch (err) {
      console.error(err);
      alert("검색 중 오류 발생");
    }
  };

  useEffect(() => {
    if (searchOn) {
      setShow(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [searchOn]);

  return (
    <div className={`search_popup ${searchOn ? "show" : ""}`}>
      <div className="search">
        <input
          ref={inputRef} // ✅ 연결
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          onClick={searchBtn}
          className="fontello icon-search-1"
          aria-label="search"
        ></button>
        <button
          className="fontello icon-cancel"
          onClick={() => {
            setSearchOn(false);
          }}
          aria-label="cancel"
        ></button>
      </div>
    </div>
  );
}
