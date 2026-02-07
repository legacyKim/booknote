// 구글 드라이브 다운로드 기능 테스트 스크립트

const {
  getFilesFromFolder,
  downloadAllFilesFromFolder,
} = require("./googleDrive");

async function testDownload() {
  try {
    console.log("🔍 구글 드라이브 연결 테스트 시작...\n");

    // 1. file 폴더 목록 조회 테스트
    console.log("📁 file 폴더 목록 조회...");
    const fileList = await getFilesFromFolder("file");
    console.log(`   → ${fileList.length}개 파일 발견:`);
    fileList.forEach((file) => {
      console.log(
        `     - ${file.name} (${file.size} bytes, ${file.modifiedTime})`,
      );
    });

    console.log("\n📁 task 폴더 목록 조회...");
    const taskList = await getFilesFromFolder("task");
    console.log(`   → ${taskList.length}개 파일 발견:`);
    taskList.forEach((file) => {
      console.log(
        `     - ${file.name} (${file.size} bytes, ${file.modifiedTime})`,
      );
    });

    // 2. file 폴더 전체 다운로드 테스트
    console.log("\n⬇️  file 폴더 전체 다운로드 시작...");
    const fileDownload = await downloadAllFilesFromFolder("file");
    console.log("\n✅ file 폴더 다운로드 결과:");
    console.log(`   📂 저장 경로: ${fileDownload.downloadPath}`);
    console.log(
      `   📊 총 ${fileDownload.totalFiles}개 중 ${fileDownload.results.filter((r) => !r.failed).length}개 성공`,
    );

    fileDownload.results.forEach((result) => {
      if (result.failed) {
        console.log(`   ❌ ${result.originalName}: ${result.error}`);
      } else if (result.renamed) {
        console.log(
          `   🔄 ${result.originalName} → ${result.savedName} (이름 변경됨)`,
        );
      } else {
        console.log(`   ✅ ${result.originalName}`);
      }
    });

    // 3. task 폴더 전체 다운로드 테스트
    console.log("\n⬇️  task 폴더 전체 다운로드 시작...");
    const taskDownload = await downloadAllFilesFromFolder("task");
    console.log("\n✅ task 폴더 다운로드 결과:");
    console.log(`   📂 저장 경로: ${taskDownload.downloadPath}`);
    console.log(
      `   📊 총 ${taskDownload.totalFiles}개 중 ${taskDownload.results.filter((r) => !r.failed).length}개 성공`,
    );

    taskDownload.results.forEach((result) => {
      if (result.failed) {
        console.log(`   ❌ ${result.originalName}: ${result.error}`);
      } else if (result.renamed) {
        console.log(
          `   🔄 ${result.originalName} → ${result.savedName} (이름 변경됨)`,
        );
      } else {
        console.log(`   ✅ ${result.originalName}`);
      }
    });

    console.log("\n🎉 모든 테스트 완료!");
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error.message);
  }
}

// 실행
if (require.main === module) {
  testDownload();
}

module.exports = { testDownload };
