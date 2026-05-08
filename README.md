OpenSign Next
AGPLv3 licensed, Headless & Self-hosted Document Signing Engine.

## 🎯 목적 (Purpose)
OpenSign-Next는 무거운 클라이언트 렌더링 방식에서 벗어나, 서버 기반의 가벼운(Thin Client) 전자 서명 및 문서 폼 입력 환경을 제공하는 **Headless & Self-hosted 문서 서명 엔진**입니다. 브라우저의 성능 저하를 방지하고, REST API 및 웹훅을 통해 기존 시스템에 쉽게 연동할 수 있도록 설계되었습니다.

## ✨ 주요 기능 (Features)
- **Thin Client Architecture**: 프론트엔드에서 무거운 PDF 라이브러리(PDF.js 등)를 로드하지 않습니다. 서버(`pdf2pic`)에서 PDF 페이지를 이미지로 변환하여 브라우저로 스트리밍하므로, 대용량 PDF 파일에서도 메모리 크래시 없이 빠르고 쾌적하게 동작합니다.
- **Headless First**: 복잡하고 무거운 UI 프레임워크에 종속되지 않습니다. 모든 전자 서명 및 폼 제출은 단순한 REST API와 Webhook을 통해 백엔드에서 제어하고 통합할 수 있습니다.
- **동적 폼 필드 관리 (Dynamic Field Management)**: 직관적인 관리자 UI를 통해 텍스트(TEXT), 날짜(DATE), 체크박스(CHECKBOX), 서명(SIGNATURE) 등의 입력 필드를 추가, 수정, 삭제 및 문서 내 배치(X, Y 좌표 지정)를 손쉽게 할 수 있습니다.
- **Framework Agnostic Core**: 핵심 로직인 `@open-sign/core` 모듈은 특정 프레임워크에 얽매이지 않고 어떠한 Node.js 환경에서도 독립적으로 실행될 수 있습니다.
- **Turborepo 기반 모노레포**: 프론트엔드(React/Vite), 백엔드(NestJS), 코어 패키지 등 다중 프로젝트를 효율적으로 관리하고 빌드할 수 있는 모노레포 구조를 채택했습니다.

Quick Start (Local Dev)
# 1. Clone & Install
git clone https://github.com/your-org/open-sign-next.git
cd open-sign-next
npm install
# 2. Start Infrastructure (MinIO, Redis)docker-compose up -d minio redis
# 3. Start Development Servers (API + Client)npm run dev

External Integration Example (Headless API)
Instead of using the UI, generate signed PDFs directly from your backend:

curl -X POST http://localhost:3000/api/v1/headless/submissions \
  -H "x-api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '{
    "pdfBase64": "...",
    "fields": [
      { "id": "f1", "type": "text", "page": 1, "x": 0.5, "y": 0.8, "width": 0.3, "height": 0.05, "value": "John Doe" }
    ],
    "webhookUrl": "https://your-server.com/webhook",
    "metadata": { "contractId": "123" }
  }'

  OpenSign Next 시작하기 (초보자 가이드)
안녕하세요! OpenSign Next 프로젝트에 오신 것을 환영합니다.
이 가이드는 컴퓨터 프로그래밍에 익숙하지 않으신 분도 복사와 붙여넣기만으로 프로그램을 켜고 화면을 볼 수 있도록 만들어졌습니다.

무서워하지 마시고 천천히 한 단계씩 따라와 주세요! 🙌

🛠️ 시작 전 준비물 (4가지)
프로그램을 실행하려면 컴퓨터에 아래 4개의 프로그램이 필요합니다. (이미 있다면 건너뛰셔도 됩니다.)

Git: 인터넷에서 코드를 다운로드받는 도구입니다.
다운로드: git-scm.com 에서 본인 컴퓨터(OS)에 맞는 것을 설치하세요. (설치 중 나오는 옵션은 전부 'Next' 누르셔도 무방합니다.)
Node.js: 우리 프로그램을 구동하는 엔진입니다.
다운로드: nodejs.org 에서 **LTS(추천 버전)**를 설치하세요.
VS Code: 코드를 보고 수정하는 편집기입니다.
다운로드: code.visualstudio.com에서 설치하세요.
Docker Desktop: 데이터베이스 같은 무거운 프로그램을 가볍게 띄워주는 마법의 도구입니다.
다운로드: docker.com/products/docker-desktop에서 설치하세요.
⚠️ 주의: 설치 후 컴퓨터를 한 번 재부팅해야 정상 작동합니다.
1단계: 코드 다운로드하기
컴퓨터 바탕화면에 빈 폴더를 하나 만들고 이름은 my-projects로 짓습니다.
VS Code를 켜고, 왼쪽 위 파일 -> 폴더 열기를 눌러 방금 만든 my-projects 폴더를 엽니다.
VS Code 맨 위에 있는 메뉴에서 터미널 -> 새 터미널을 클릭합니다. (화면 아래에 검은색/흰색 창이 하나 나타납니다.)
검은 창에 아래 명령어를 복사해서 붙여넣고 Enter를 칩니다.
bash

git clone https://github.com/your-org/open-sign-next.git
(※ your-org 부분은 실제 GitHub 주소로 바꿔주세요)

다운이 끝나면, 아래 명령어를 복사해서 붙여넣고 Enter를 쳐서 다운받은 폴더로 들어갑니다.
bash

cd open-sign-next
2단계: 필수 재료 설치하기 (npm install)
코드만 다운로드했다고 끝이 아닙니다. 코드가 작동하기 위해 필요한 '부품(라이브러리)'들을 다운로드해야 합니다.

터미널 창에 아래 명령어를 복사해서 붙여넣고 Enter를 칩니다.

bash

npm install
💡 화면에 영어가 주르륵 올라가면서 멈춘 것 같나요?
처음 설치할 때는 1~3분 정도 시간이 걸립니다. 화면 맨 밑에 입력할 수 있는 깜빡이(커서)가 다시 나타날 때까지 가만히 기다려주세요.
3단계: 배경 프로그램 켜기 (Docker)
우리 프로그램은 문서를 저장할 창고(MinIO)와 기다림줄(Redis)이 필요합니다. 이걸 컴퓨터에 직접 설치하는 대신, Docker를 이용해 가볍게 켭니다.

컴퓨터에서 Docker Desktop 프로그램을 실행합니다. (작업표시줄에 고래 아이콘이 뜨면 켜진 것입니다.)
VS Code의 터미널 창에 아래 명령어를 복사해서 붙여넣고 Enter를 칩니다.
bash

docker-compose up -d
💡 -d는 무슨 뜻인가요?
백그라운드(뒷단)에서 조용히 실행하라는 뜻입니다. 터미널 창을 계속 쓸 수 있게 해줍니다.
제대로 켜졌는지 확인하려면 아래 명령어를 치세요.
bash

docker ps
minio와 redis라는 이름이 보이면 성공입니다! 🎉

4단계: 비밀번호 설정하기 (.env 파일)
보안을 위해 외부와 연동할 때 쓸 '비밀번호(API 키)'를 설정해야 합니다.

VS Code 왼쪽 파일 목록에서 맨 위(루트) 폴더를 클릭합니다.
VS Code 위쪽 메뉴에서 파일 -> 새 파일을 클릭하고 이름을 .env 로 만듭니다. (앞에 점(.)이 있어야 합니다!)
만들어진 `.env`` 파일에 아래 내용을 복사해서 붙여넣습니다.
env

# 외부 연동 시 사용할 마스터 키입니다. 본인만의 알아볼 수 없는 긴 영어로 바꿔주세요.
OPEN_SIGN_API_KEY=my-super-secret-api-key-12345

# 웹훅 보안을 위한 암호입니다. 이것도 아무나 알아볼 수 없게 바꿔주세요.
WEBHOOK_SECRET=webhook-secret-change-me-67890

# 데이터베이스(창고) 설정입니다. (기본값 그대로 두셔도 됩니다)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=opensign
S3_SECRET_KEY=opensign_password
S3_BUCKET=documents
REDIS_HOST=localhost
Ctrl + S (맥은 Cmd + S)를 눌러 저장합니다.
5단계: 프로그램 실행하기! (npm run dev)
드디어 모든 준비가 끝났습니다. 프로그램을 켜보겠습니다.

터미널 창에 아래 명령어를 복사해서 붙여넣고 Enter를 칩니다.

bash

npm run dev
터미널에 이런저런 글자들이 올라가면서 아래와 같은 메시지가 나오면 성공입니다!

[ready] started server on 0.0.0.0:80, url: http://localhost/
[ready] started server on 0.0.0.0:3000, url: http://localhost:3000/

🎊 화면 확인하기
인터넷 브라우저(크롬, 엣지 등)를 열고 주소창에 아래 주소를 입력해 보세요.

화면(프론트엔드): 👉 http://localhost
창고 화면(MinIO): 👉 [http://localhost:9001] (아이디: opensign / 비번: opensign_password 입력)
😱 혹시 안 되나요? (초보자 에러 해결법)
에러가 나면 당황스럽지만, 90% 아래의 원인 중 하나입니다.

Q. npm install 할 때 "어쩌구 에러입니다"라고 빨간 글자가 나와요.
👉 Node.js를 설치하셨나요? nodejs.org에서 LTS 버전을 꼭 설치해야 합니다.

Q. docker-compose 명령어를 치면 "command not found"라고 나와요.
👉 Docker Desktop 프로그램이 켜져 있나요? 컴퓨터를 재부팅하셨나요? 프로그램이 켜져있지 않으면 터미널에서 인식하지 못합니다.

Q. 실행(npm run dev)을 했는데 "Port 3000 is already in use"라고 나와요.
👉 3000번 문을 이미 다른 프로그램이 쓰고 있다는 뜻입니다. VS Code를 껐다 켜보거나, 컴퓨터를 껐다 켜보세요.

Q. .env 파일을 만들었는데 계속 에러가 나요.
👉 파일 이름이 .env가 맞는지 확인해 보세요. .env.txt나 .env. 처럼 뒤에 숨겨진 글자가 있으면 안 됩니다. VS Code 파일 목록에 톱니바퀴 아이콘으로 보이면 정상입니다.