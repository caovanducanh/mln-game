const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const state = {
  round: 0,
  maxRounds: 6,
  stats: {
    growth: 50,
    equity: 50,
    trust: 50,
    regulation: 50,
    innovation: 50
  },
  score: 0,
  notes: []
};

const theorySnippets = [
  "Loi ich kinh te la quan he phan phoi giua cac chu the: Nha nuoc, doanh nghiep, nguoi lao dong va cong dong.",
  "Kinh te tu nhan la dong luc quan trong, nhung can dat trong khung phap ly va trach nhiem xa hoi.",
  "Nha nuoc dieu tiet bang thue, ngan sach, phap luat lao dong, chinh sach an sinh va giam sat canh tranh.",
  "Moi quyet sach can can bang 3 lop loi ich: ca nhan, tap the, xa hoi; uu tien loi ich chung dai han.",
  "Neu loi ich nhom lan at loi ich cong, niem tin xa hoi suy giam va chi phi dieu chinh tang cao.",
  "Quan he bien chung: loi ich ca nhan tao dong luc sang tao, loi ich tap the tao suc manh hop tac, loi ich xa hoi dinh huong phat trien ben vung."
];

const scenarios = [
  {
    type: "Lao dong - tien luong",
    title: "Luong toi thieu va nang suat",
    text: "Gia ca tang nhanh, cong nhan de xuat tang luong toi thieu. Doanh nghiep lo ngai chi phi leo thang va giam canh tranh.",
    choices: [
      {
        title: "Tang luong toi thieu theo lo trinh 2 dot",
        note: "Ket hop ho tro dao tao nang suat cho doanh nghiep nho.",
        effects: { growth: 3, equity: 10, trust: 7, regulation: 5, innovation: 2 },
        moods: {
          citizen: { tone: "good", text: "Nguoi dan thay doi song co duoc cai thien." },
          worker: { tone: "good", text: "Nguoi lao dong duoc chia se thanh qua tang truong." },
          business: { tone: "neutral", text: "Doanh nghiep chap nhan, nhung can toi uu van hanh." },
          state: { tone: "good", text: "Nha nuoc giu duoc can bang ngan han va dai han." }
        },
        theory: "Dieu tiet loi ich qua lo trinh giup giam xung dot giua lao dong va von, tranh soc chi phi dot ngot."
      },
      {
        title: "Giu nguyen luong toi thieu trong 1 nam",
        note: "Uu tien giam chi phi doanh nghiep de day manh xuat khau.",
        effects: { growth: 7, equity: -9, trust: -8, regulation: -3, innovation: 1 },
        moods: {
          citizen: { tone: "bad", text: "Nguoi dan lo lang vi thu nhap thuc giam." },
          worker: { tone: "bad", text: "Cong nhan bat man vi suc mua giam." },
          business: { tone: "good", text: "Doanh nghiep co them bien do chi phi." },
          state: { tone: "neutral", text: "Nha nuoc giai quyet tang truong ngan han nhung ap luc xa hoi tang." }
        },
        theory: "Tang truong neu khong gan voi phan phoi hop ly se lam yeu nen tang dong thuan xa hoi."
      },
      {
        title: "Tang manh luong toi thieu ngay lap tuc",
        note: "Dam bao thu nhap, chap nhan doanh nghiep phai tu dieu chinh nhanh.",
        effects: { growth: -4, equity: 12, trust: 6, regulation: 2, innovation: -3 },
        moods: {
          citizen: { tone: "good", text: "Nguoi dan hoan nghenh quyen loi duoc bao ve." },
          worker: { tone: "good", text: "Nguoi lao dong hai long ro ret." },
          business: { tone: "bad", text: "Doanh nghiep bi dong chi phi, lo ngai cat giam viec lam." },
          state: { tone: "neutral", text: "Nha nuoc can bo sung goi ho tro chuyen doi." }
        },
        theory: "Can bang loi ich can tinh den suc chiu cua thi truong; qua nhanh co the tao tac dung phu."
      }
    ]
  },
  {
    type: "Thue va dau tu",
    title: "Uu dai cho khu vuc tu nhan cong nghe",
    text: "Mot cum doanh nghiep de xuat uu dai thue lon de dau tu AI va cong nghiep xanh. Xa hoi quan tam tinh minh bach va hieu qua ngan sach.",
    choices: [
      {
        title: "Uu dai co dieu kien va cong khai KPI",
        note: "Gan uu dai voi viec lam chat luong cao, chuyen giao cong nghe va bao cao cong khai.",
        effects: { growth: 8, equity: 5, trust: 8, regulation: 7, innovation: 9 },
        moods: {
          citizen: { tone: "good", text: "Nguoi dan thay ro loi ich tu dau tu moi." },
          worker: { tone: "good", text: "Co hoi viec lam moi va dao tao ky nang tang." },
          business: { tone: "good", text: "Doanh nghiep co dong luc dau tu dai han." },
          state: { tone: "good", text: "Nha nuoc dieu tiet bang hop dong trach nhiem ro rang." }
        },
        theory: "Vai tro Nha nuoc la thiet ke luat choi de loi ich rieng dong gop vao loi ich chung."
      },
      {
        title: "Uu dai rong, thu tuc nhanh",
        note: "Dat muc tieu thu hut von manh trong ngan han.",
        effects: { growth: 10, equity: -6, trust: -7, regulation: -8, innovation: 6 },
        moods: {
          citizen: { tone: "bad", text: "Nguoi dan nghi ngai uu dai nghieng ve mot so nhom." },
          worker: { tone: "neutral", text: "Co them viec lam nhung chat luong chua chac cao." },
          business: { tone: "good", text: "Doanh nghiep rat hao hung vi chi phi giam." },
          state: { tone: "bad", text: "Nha nuoc kho kiem soat that thu va hieu qua." }
        },
        theory: "Thieu co che giam sat se de phat sinh loi ich nhom va that thoat nguon luc cong."
      },
      {
        title: "Khong uu dai them",
        note: "Bao toan ngan sach, tap trung chi cho an sinh.",
        effects: { growth: -2, equity: 4, trust: 2, regulation: 3, innovation: -5 },
        moods: {
          citizen: { tone: "neutral", text: "Nguoi dan thay ngan sach on dinh hon." },
          worker: { tone: "neutral", text: "Nguoi lao dong chua thay co hoi ky nang moi." },
          business: { tone: "bad", text: "Doanh nghiep cham mo rong du an moi." },
          state: { tone: "neutral", text: "Nha nuoc an toan ngan sach nhung bo lo co hoi doi moi." }
        },
        theory: "Dieu tiet khong chi la han che ma con la kich hoat dong luc dung muc tieu."
      }
    ]
  },
  {
    type: "Dat dai va ha tang",
    title: "Giai phong mat bang cho tuyen cao toc",
    text: "Du an ha tang lien vung can thu hoi dat nhanh. Neu boi thuong khong thoa dang, xung dot voi dan cu va doanh nghiep dia phuong se tang.",
    choices: [
      {
        title: "Dinh gia boi thuong sat thi truong + tai dinh cu tot",
        note: "Cong khai quy trinh, co to hoa giai doc lap.",
        effects: { growth: 6, equity: 9, trust: 9, regulation: 8, innovation: 2 },
        moods: {
          citizen: { tone: "good", text: "Ho dan tin tuong vi quyen loi duoc ton trong." },
          worker: { tone: "good", text: "Tien do du an on dinh, viec lam xay dung duoc duy tri." },
          business: { tone: "good", text: "Doanh nghiep huong loi tu ha tang nhung van dong thuan xa hoi." },
          state: { tone: "good", text: "Nha nuoc giam khieu kien va chi phi xung dot." }
        },
        theory: "Loi ich xa hoi dai han can di cung co che den bu cong bang cho loi ich ca nhan truc tiep bi anh huong."
      },
      {
        title: "Thu hoi nhanh de kip tien do",
        note: "Tam uu tien toc do giai ngan va thi cong.",
        effects: { growth: 8, equity: -8, trust: -10, regulation: -6, innovation: 1 },
        moods: {
          citizen: { tone: "bad", text: "Dan cu buc xuc do boi thuong chua thoa dang." },
          worker: { tone: "neutral", text: "Viec lam co nhung moi truong xa hoi bat on." },
          business: { tone: "good", text: "Nha thau va doanh nghiep huong loi ngan han." },
          state: { tone: "bad", text: "Nha nuoc doi mat khieu kien va mat niem tin." }
        },
        theory: "Neu coi nhe cong bang thu tuc, loi ich cong co the bi nhin nhu loi ich nhom."
      },
      {
        title: "Tam hoan de ra soat toan bo",
        note: "Giam xung dot ngay, chap nhan tri hoan du an.",
        effects: { growth: -5, equity: 5, trust: 4, regulation: 6, innovation: -2 },
        moods: {
          citizen: { tone: "good", text: "Nguoi dan thay duoc lang nghe y kien." },
          worker: { tone: "neutral", text: "Tien do cham lam thu nhap mot so nhom lao dong giam." },
          business: { tone: "bad", text: "Doanh nghiep that vong vi tre ke hoach." },
          state: { tone: "neutral", text: "Nha nuoc co them thoi gian hoan thien co che." }
        },
        theory: "Dieu tiet can ket hop hieu qua va chinh danh; cham hon mot chut de tranh chi phi xa hoi lon hon sau nay."
      }
    ]
  },
  {
    type: "An sinh va ngan sach",
    title: "Quy bao hiem that nghiep gap ap luc",
    text: "Nhieu doanh nghiep cat giam don hang, lao dong mat viec tang. Quy bao hiem can mo rong chi tra nhung ngan sach bi gioi han.",
    choices: [
      {
        title: "Mo rong tro cap co dieu kien dao tao lai",
        note: "Tro cap 6 thang va chuong trinh nang cap ky nang bat buoc.",
        effects: { growth: 4, equity: 10, trust: 8, regulation: 6, innovation: 5 },
        moods: {
          citizen: { tone: "good", text: "Dan cu thay he thong an sinh hoat dong hieu qua." },
          worker: { tone: "good", text: "Nguoi lao dong co diem tua de quay lai thi truong." },
          business: { tone: "neutral", text: "Doanh nghiep co nguon lao dong duoc dao tao lai." },
          state: { tone: "good", text: "Nha nuoc giu on dinh xa hoi trong giai doan kho." }
        },
        theory: "An sinh la cong cu dieu tiet loi ich de on dinh cau xa hoi va tao nang luc moi cho tang truong."
      },
      {
        title: "Chi tro cap ngan han, giam muc chi",
        note: "Bao toan quy, uu tien can doi tai khoa.",
        effects: { growth: 1, equity: -7, trust: -6, regulation: 2, innovation: -2 },
        moods: {
          citizen: { tone: "bad", text: "Ho gia dinh thu nhap thap gap kho khan keo dai." },
          worker: { tone: "bad", text: "Nguoi lao dong lo ngai bi bo lai phia sau." },
          business: { tone: "good", text: "Doanh nghiep duoc giam ap luc dong gop ngan han." },
          state: { tone: "neutral", text: "Nha nuoc giu quy nhung tang ap luc xa hoi." }
        },
        theory: "Neu bo qua loi ich nhom yeu the, thi su on dinh cho thi truong cung suy giam."
      },
      {
        title: "Tang tro cap cao, khong rang buoc dao tao",
        note: "Giai cuu khan cap dien rong.",
        effects: { growth: -3, equity: 7, trust: 4, regulation: -4, innovation: -4 },
        moods: {
          citizen: { tone: "good", text: "Nguoi dan duoc ho tro nhanh trong ngan han." },
          worker: { tone: "good", text: "Nguoi lao dong bot ap luc tai chinh truoc mat." },
          business: { tone: "neutral", text: "Doanh nghiep lo ngai thieu dong luc quay lai lam viec." },
          state: { tone: "bad", text: "Nha nuoc gap kho trong can doi tai khoa dai han." }
        },
        theory: "Dieu tiet hieu qua can ket hop ho tro va tao dong luc tu luc, tranh tam ly phu thuoc."
      }
    ]
  },
  {
    type: "Phong chong tham nhung",
    title: "Phat hien lien minh dau thau bat thuong",
    text: "Thanh tra phat hien dau hieu thong dong trong mot goi mua sam cong lon. Xu ly sao de vua nghiem minh vua khong dong bang du an can thiet?",
    choices: [
      {
        title: "Tam dung goi thau, xu ly cong khai va dau thau lai",
        note: "Cong bo du lieu, bao ve nguoi to cao, su dung giam sat so.",
        effects: { growth: 2, equity: 11, trust: 12, regulation: 12, innovation: 2 },
        moods: {
          citizen: { tone: "good", text: "Nguoi dan tang niem tin vao phap quyen." },
          worker: { tone: "good", text: "Nguoi lao dong ky vong moi truong lam viec minh bach." },
          business: { tone: "neutral", text: "Doanh nghiep lam an dung luat duoc bao ve." },
          state: { tone: "good", text: "Nha nuoc cuong co nang luc dieu tiet va ky cuong." }
        },
        theory: "Chong tham nhung la dieu kien can de loi ich kinh te van hanh theo huong phat trien chung."
      },
      {
        title: "Xu ly noi bo kin de tranh on ao",
        note: "Giu tien do du an, tranh tac dong truyen thong.",
        effects: { growth: 5, equity: -9, trust: -11, regulation: -10, innovation: -1 },
        moods: {
          citizen: { tone: "bad", text: "Du luan nghi co bao che loi ich nhom." },
          worker: { tone: "bad", text: "Nguoi lao dong giam niem tin vao su cong bang." },
          business: { tone: "good", text: "Mot so doanh nghiep than huu de tho hon." },
          state: { tone: "bad", text: "Nha nuoc mat uy tin va kho dieu tiet ve sau." }
        },
        theory: "Khi thieu minh bach, loi ich rieng de bien thanh dac quyen va tao mau thuan xa hoi."
      },
      {
        title: "Phat tien nhe de tiep tuc trien khai",
        note: "Can doi giua re de va giu tien do.",
        effects: { growth: 4, equity: -6, trust: -7, regulation: -5, innovation: 0 },
        moods: {
          citizen: { tone: "bad", text: "Nguoi dan thay muc xu ly chua tuong xung." },
          worker: { tone: "neutral", text: "Nguoi lao dong chua thay thay doi he thong ro rang." },
          business: { tone: "good", text: "Doanh nghiep vi pham thay rui ro thap." },
          state: { tone: "neutral", text: "Nha nuoc giu duoc tien do nhung giam suc ran de." }
        },
        theory: "Che tai yeu lam bien dang dong co thi truong va pha vo canh tranh cong bang."
      }
    ]
  },
  {
    type: "Phat trien vung",
    title: "Can bang dau tu giua do thi va nong thon",
    text: "Do thi dong gop GDP cao, trong khi nong thon can ha tang so, y te va giao duc de giam chenhlech co hoi.",
    choices: [
      {
        title: "Chia ngan sach theo chi so phat trien can bang vung",
        note: "Do thi tiep tuc tang truong, nong thon duoc uu tien ha tang thiet yeu.",
        effects: { growth: 5, equity: 10, trust: 8, regulation: 7, innovation: 4 },
        moods: {
          citizen: { tone: "good", text: "Nguoi dan thay co hoi tiep can dich vu cong de hon." },
          worker: { tone: "good", text: "Lao dong dia phuong co them co hoi viec lam tai cho." },
          business: { tone: "neutral", text: "Doanh nghiep phai dieu chinh chien luoc dia ly." },
          state: { tone: "good", text: "Nha nuoc tang ket noi thi truong trong nuoc." }
        },
        theory: "Hai hoa loi ich khong dong nghia chia deu may moc, ma la phan bo theo muc tieu cong bang co hieu qua."
      },
      {
        title: "Tap trung toi da vao do thi dau tau",
        note: "Ky vong hieu ung lan toa tu trung tam kinh te lon.",
        effects: { growth: 9, equity: -8, trust: -6, regulation: -2, innovation: 6 },
        moods: {
          citizen: { tone: "bad", text: "Khu vuc yeu the cam thay bi bo lai phia sau." },
          worker: { tone: "neutral", text: "Lao dong di cu tang, ap luc an sinh do thi lon." },
          business: { tone: "good", text: "Doanh nghiep o trung tam huong loi ro ret." },
          state: { tone: "neutral", text: "Nha nuoc co tang truong cao nhung phan hoa manh hon." }
        },
        theory: "Tang truong bo cuc co the tao bat binh dang co cau neu khong co co che dieu tiet bo sung."
      },
      {
        title: "Chia deu ngan sach cho moi tinh",
        note: "Dam bao hinh thuc cong bang ngan han.",
        effects: { growth: -3, equity: 4, trust: 3, regulation: 2, innovation: -3 },
        moods: {
          citizen: { tone: "neutral", text: "Nguoi dan thay cong bang hinh thuc nhung hieu qua chua cao." },
          worker: { tone: "neutral", text: "Co mot so cai thien nhung toc do cham." },
          business: { tone: "bad", text: "Doanh nghiep cho rang nguon luc bi dan trai." },
          state: { tone: "neutral", text: "Nha nuoc de quan ly nhung kho tao dot pha." }
        },
        theory: "Cong bang can gan voi nang suat su dung nguon luc, tranh binh quan chu nghia."
      }
    ]
  }
];

const dom = {
  growthBar: document.getElementById("growthBar"),
  equityBar: document.getElementById("equityBar"),
  trustBar: document.getElementById("trustBar"),
  stateBar: document.getElementById("stateBar"),
  growthValue: document.getElementById("growthValue"),
  equityValue: document.getElementById("equityValue"),
  trustValue: document.getElementById("trustValue"),
  stateValue: document.getElementById("stateValue"),
  roundLabel: document.getElementById("roundLabel"),
  scenarioType: document.getElementById("scenarioType"),
  scenarioTitle: document.getElementById("scenarioTitle"),
  scenarioText: document.getElementById("scenarioText"),
  choices: document.getElementById("choices"),
  knowledgeLog: document.getElementById("knowledgeLog"),
  finalPanel: document.getElementById("finalPanel"),
  endingTitle: document.getElementById("endingTitle"),
  endingText: document.getElementById("endingText"),
  endingBullets: document.getElementById("endingBullets"),
  restartBtn: document.getElementById("restartBtn"),
  citizenMood: document.getElementById("citizenMood"),
  workerMood: document.getElementById("workerMood"),
  businessMood: document.getElementById("businessMood"),
  stateMood: document.getElementById("stateMood"),
  citizenPortrait: document.getElementById("citizenPortrait"),
  workerPortrait: document.getElementById("workerPortrait"),
  businessPortrait: document.getElementById("businessPortrait"),
  statePortrait: document.getElementById("statePortrait")
};

function statToColor(value) {
  if (value < 35) return "#c24739";
  if (value < 60) return "#f3a521";
  return "#1e9a73";
}

function renderStats() {
  const { growth, equity, trust, regulation } = state.stats;

  dom.growthBar.style.width = `${growth}%`;
  dom.equityBar.style.width = `${equity}%`;
  dom.trustBar.style.width = `${trust}%`;
  dom.stateBar.style.width = `${regulation}%`;

  dom.growthBar.style.background = statToColor(growth);
  dom.equityBar.style.background = statToColor(equity);
  dom.trustBar.style.background = statToColor(trust);
  dom.stateBar.style.background = statToColor(regulation);

  dom.growthValue.textContent = growth;
  dom.equityValue.textContent = equity;
  dom.trustValue.textContent = trust;
  dom.stateValue.textContent = regulation;
}

function setMood(element, tone) {
  element.classList.remove("mood-good", "mood-neutral", "mood-bad");
  element.classList.add(`mood-${tone}`);
  element.classList.add("pulse");
  setTimeout(() => element.classList.remove("pulse"), 400);
}

function updateMoods(moods) {
  dom.citizenMood.textContent = moods.citizen.text;
  dom.workerMood.textContent = moods.worker.text;
  dom.businessMood.textContent = moods.business.text;
  dom.stateMood.textContent = moods.state.text;

  setMood(dom.citizenPortrait, moods.citizen.tone);
  setMood(dom.workerPortrait, moods.worker.tone);
  setMood(dom.businessPortrait, moods.business.tone);
  setMood(dom.statePortrait, moods.state.tone);
}

function pushKnowledge(text) {
  state.notes.push(text);
  const li = document.createElement("li");
  li.textContent = text;
  dom.knowledgeLog.appendChild(li);
}

function applyChoice(choice) {
  Object.entries(choice.effects).forEach(([key, value]) => {
    state.stats[key] = clamp(state.stats[key] + value, 0, 100);
  });

  const roundGain =
    choice.effects.growth * 1.2 +
    choice.effects.equity * 1.3 +
    choice.effects.trust * 1.4 +
    choice.effects.regulation * 1.1 +
    choice.effects.innovation * 1.0;

  state.score += roundGain;
  pushKnowledge(choice.theory);

  const genericTheory = theorySnippets[state.round % theorySnippets.length];
  pushKnowledge(genericTheory);

  updateMoods(choice.moods);
  state.round += 1;

  renderStats();

  if (state.round >= state.maxRounds) {
    showEnding();
  } else {
    renderScenario();
  }
}

function renderScenario() {
  const scenario = scenarios[state.round];
  dom.roundLabel.textContent = `Quy ${state.round + 1} / ${state.maxRounds}`;
  dom.scenarioType.textContent = scenario.type;
  dom.scenarioTitle.textContent = scenario.title;
  dom.scenarioText.textContent = scenario.text;

  dom.choices.innerHTML = "";

  scenario.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.innerHTML = `<span class="choice-title">${choice.title}</span><span class="choice-note">${choice.note}</span>`;
    button.addEventListener("click", () => applyChoice(choice));
    dom.choices.appendChild(button);
  });
}

function buildEnding() {
  const { growth, equity, trust, regulation } = state.stats;

  if (growth >= 65 && equity >= 60 && trust >= 60 && regulation >= 60) {
    return {
      title: "KET CUC A: PHAT TRIEN HAI HOA",
      text: "Ban da bien loi ich kinh te thanh dong luc chung. Tang truong duoc giu cung voi cong bang, niem tin va ky cuong the che.",
      bullets: [
        "Loi ich ca nhan duoc khuyen khich nhung khong tach roi loi ich cong.",
        "Khu vuc tu nhan phat trien trong khung canh tranh minh bach.",
        "Nha nuoc thuc hien tot vai tro kien tao va dieu tiet."
      ]
    };
  }

  if (growth >= 70 && (equity < 45 || trust < 45)) {
    return {
      title: "KET CUC B: TANG TRUONG LECH PHA",
      text: "Nen kinh te tang nhanh nhung bat binh dang va nghi ngo xa hoi gia tang. Loi ich nhom bat dau lan at loi ich toan dan.",
      bullets: [
        "Dong luc ngan han cao nhung rui ro xung dot xa hoi tang.",
        "Can tang dieu tiet ve lao dong, thue va canh tranh cong bang.",
        "Phai uu tien minh bach de phuc hoi niem tin."
      ]
    };
  }

  if (equity >= 70 && growth < 45) {
    return {
      title: "KET CUC C: BAO TRO QUA MUC",
      text: "Cong bang ngan han duoc cai thien nhung nen tang nang suat va doi moi chua du manh, khien tang truong cham lai.",
      bullets: [
        "Can ket hop an sinh voi nang cao nang suat lao dong.",
        "Uu dai can gan KPI ro rang de tao gia tri moi.",
        "Dieu tiet hieu qua la can bang giua ho tro va dong luc."
      ]
    };
  }

  return {
    title: "KET CUC D: CAN BANG MONG MANH",
    text: "Ban giu duoc mot phan can bang, nhung mot so mat tran van bat on. Day la luc can cai cach the che sau hon.",
    bullets: [
      "Tang truong, cong bang va niem tin phai di cung nhau.",
      "Quan he bien chung ca nhan - tap the - xa hoi can duoc xu ly dong bo.",
      "Nha nuoc can nang cao chat luong du bao va giam sat chinh sach."
    ]
  };
}

function showEnding() {
  const ending = buildEnding();
  dom.endingTitle.textContent = ending.title;
  dom.endingText.textContent = ending.text;
  dom.endingBullets.innerHTML = "";

  ending.bullets.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    dom.endingBullets.appendChild(li);
  });

  pushKnowledge(`Tong ket diem chien luoc: ${Math.round(state.score)}.`);
  pushKnowledge("Danh gia bien chung: loi ich ca nhan la dong luc, loi ich tap the la bo nhan, loi ich xa hoi la dich den.");

  dom.finalPanel.classList.remove("hidden");
  dom.choices.innerHTML = "";
  dom.scenarioTitle.textContent = "Ban da hoan thanh 6 quyet sach chien luoc.";
  dom.scenarioText.textContent = "Xem ket qua ben duoi va choi lai de thu mot mo hinh dieu tiet loi ich khac.";
  dom.roundLabel.textContent = "Chien dich ket thuc";
  dom.scenarioType.textContent = "Tong ket";
}

function resetGame() {
  state.round = 0;
  state.score = 0;
  state.notes = [];
  state.stats = {
    growth: 50,
    equity: 50,
    trust: 50,
    regulation: 50,
    innovation: 50
  };

  dom.knowledgeLog.innerHTML = "";
  dom.finalPanel.classList.add("hidden");

  dom.citizenMood.textContent = "Dang cho quyet dinh...";
  dom.workerMood.textContent = "Dang cho quyet dinh...";
  dom.businessMood.textContent = "Dang cho quyet dinh...";
  dom.stateMood.textContent = "Dang theo doi...";

  setMood(dom.citizenPortrait, "neutral");
  setMood(dom.workerPortrait, "neutral");
  setMood(dom.businessPortrait, "neutral");
  setMood(dom.statePortrait, "neutral");

  pushKnowledge("Khoi dong nhiem ky: uu tien tang truong bao trum va giam xung dot loi ich.");
  pushKnowledge("Nguyen tac game: moi quyet sach can can bang loi ich Nha nuoc - doanh nghiep - nguoi lao dong - cong dong.");

  renderStats();
  renderScenario();
}

dom.restartBtn.addEventListener("click", resetGame);

resetGame();
