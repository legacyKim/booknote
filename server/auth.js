// 한 번만 실행하는 Google Drive 인증 스크립트
const { getTokenFromCode } = require("./googleDrive");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

async function setupAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

  // 이미 토큰이 있으면 건너뛰기
  if (credentials.refresh_token) {
    console.log("✅ 이미 인증이 완료되어 있습니다.");
    return;
  }

  const { client_secret, client_id, redirect_uris } = credentials.web;
  const redirectUri =
    redirect_uris && redirect_uris.length > 0
      ? redirect_uris[0]
      : "urn:ietf:wg:oauth:2.0:oob";

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive"],
  });

  console.log("🔗 아래 URL에 접속하여 인증하세요:");
  console.log(authUrl);
  console.log("\n📋 인증 후 나오는 코드를 복사해서 아래 명령어로 입력하세요:");
  console.log("node auth.js [인증코드]");
  console.log("\n예: node auth.js 4/0AX4XfWh...");
}

// 인증 코드가 전달된 경우 처리
async function handleAuthCode(authCode) {
  try {
    await getTokenFromCode(authCode);
    console.log("✅ 인증 완료! 이제 자동 동기화가 작동합니다.");
  } catch (error) {
    console.error("❌ 인증 실패:", error.message);
  }
}

// 명령줄 인수 확인
const authCode = process.argv[2];

if (authCode) {
  handleAuthCode(authCode);
} else {
  setupAuth();
}
