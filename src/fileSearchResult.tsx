import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type tSearchResult = {
  searchText: string;
  searchOn: boolean;
  searchResult: any[];
  setSerachResMemo: React.Dispatch<React.SetStateAction<string>>;
};

export default function SearchResult({
  searchText,
  searchOn,
  searchResult,
  setSerachResMemo,
}: tSearchResult) {
  return (
    <div className={`search_result ${searchOn ? "searchOn" : ""}`}>
      {searchResult.length === 0 ? (
        <div className="no_result">결과가 없습니다.</div>
      ) : (
        <span className="notice">"{searchText}" 에 대한 검색 결과</span>
      )}

      {searchResult.map((file, idx) => (
        <div key={idx} className="search_result_box size_876">
          <div className="title">
            <h2 className="bookname">
              {file.folderType === "file"
                ? file.fileName.replace(/\.txt$/, "")
                : file.taskName || file.fileName.replace(/\.txt$/, "")}
            </h2>
            {file.folderType === "file" && (
              <h4 className="author">{file.author}</h4>
            )}
          </div>
          <ul className="search_result_list">
            {file.matches.map((item: any, i: number) => (
              <li
                key={i}
                className={file.folderType === "task" ? "task_memo" : ""}
              >
                <Link
                  to={`/${file.folderType}/${file.fileName}`}
                  onClick={() => {
                    if (file.folderType === "file") {
                      setSerachResMemo(item.memo);
                    }
                  }}
                >
                  {file.folderType === "file" ? (
                    <>
                      <p className="memo">{item.memo}</p>
                      <span className="page">{item.page}p</span>
                    </>
                  ) : (
                    <>
                      <p
                        contentEditable="true"
                        dangerouslySetInnerHTML={{ __html: item.line }}
                      />
                      <span className="line_number">
                        Line {item.lineNumber}
                      </span>
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
