import { useEffect, useMemo, useState } from "react";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const initialStats = {
  growth: 50,
  equity: 50,
  trust: 50,
  regulation: 50,
  innovation: 50
};

const MAX_ROUNDS = 6;
const SAVE_KEY = "mln-game-save-v1";

function toBand(score) {
  if (score >= 85) return "Xuất sắc";
  if (score >= 70) return "Tốt";
  if (score >= 55) return "Khá";
  if (score >= 40) return "Trung bình";
  return "Cần cải thiện";
}

function toPercent(value) {
  return Math.round(clamp(value, 0, 100));
}

function createManagementAssessment({ stats, score, decisionLog, collapse }) {
  const safeLog = Array.isArray(decisionLog) ? decisionLog : [];
  const roundsPlayed = Math.max(1, safeLog.length);

  const aggregate = safeLog.reduce(
    (acc, item) => {
      acc.growth += item.effects.growth;
      acc.equity += item.effects.equity;
      acc.trust += item.effects.trust;
      acc.regulation += item.effects.regulation;
      acc.innovation += item.effects.innovation;
      return acc;
    },
    { growth: 0, equity: 0, trust: 0, regulation: 0, innovation: 0 }
  );

  const avgGrowthPush = aggregate.growth / roundsPlayed;
  const avgEquityPush = aggregate.equity / roundsPlayed;
  const avgTrustPush = aggregate.trust / roundsPlayed;
  const avgRegPush = aggregate.regulation / roundsPlayed;

  const coordinationBalance =
    100 -
    Math.round(
      (Math.abs(stats.growth - stats.equity) +
        Math.abs(stats.equity - stats.trust) +
        Math.abs(stats.trust - stats.regulation)) /
        3
    );

  const macroSteering = toPercent(stats.growth * 0.45 + stats.innovation * 0.35 + stats.regulation * 0.2);
  const socialCoordination = toPercent(stats.equity * 0.45 + stats.trust * 0.35 + stats.regulation * 0.2);
  const policyExecution = toPercent(stats.regulation * 0.55 + stats.trust * 0.25 + stats.growth * 0.2);
  const systemicResilience = toPercent((coordinationBalance + Math.min(stats.growth, stats.equity, stats.trust, stats.regulation)) / 2);

  const overallScore = toPercent(
    macroSteering * 0.28 +
      socialCoordination * 0.28 +
      policyExecution * 0.24 +
      systemicResilience * 0.2 +
      Math.min(10, Math.max(-10, score / 30))
  );

  const strengths = [];
  const risks = [];
  const actions = [];

  if (macroSteering >= 70) strengths.push("Giữ được động lực tăng trưởng và đổi mới trong điều kiện áp lực chính sách.");
  if (socialCoordination >= 70) strengths.push("Cân bằng lợi ích xã hội tốt, giảm xung đột giữa các nhóm lợi ích.");
  if (policyExecution >= 70) strengths.push("Năng lực điều phối và thực thi chính sách ổn định, có tính nhất quán.");
  if (systemicResilience >= 70) strengths.push("Hệ thống có độ bền cao trước biến động, ít rơi vào lệch pha phát triển.");

  if (stats.equity < 45) risks.push("Công bằng phân phối thấp, nguy cơ bất mãn xã hội và giảm đồng thuận chính sách.");
  if (stats.trust < 45) risks.push("Niềm tin xã hội yếu, phản ứng dư luận có thể làm giảm hiệu lực điều hành.");
  if (stats.regulation < 45) risks.push("Năng lực điều tiết còn mỏng, dễ phát sinh độ trễ và xung đột khi triển khai.");
  if (coordinationBalance < 50) risks.push("Các chỉ số phát triển lệch nhau lớn, hệ thống có dấu hiệu mất nhịp điều phối.");
  if (collapse) risks.push("Chiến dịch dừng sớm cho thấy ngưỡng an toàn hệ thống đã bị vượt qua.");

  if (avgGrowthPush > 3 && avgEquityPush < 1) {
    actions.push("Chu kỳ tới cần gắn chính sách thúc tăng trưởng với công cụ bù đắp cho nhóm dễ tổn thương.");
  }
  if (avgRegPush < 2) {
    actions.push("Ưu tiên nâng năng lực thực thi: chuẩn dữ liệu, KPI liên ngành và cơ chế giám sát theo quý.");
  }
  if (avgTrustPush < 1) {
    actions.push("Thiết kế truyền thông chính sách theo từng nhóm đối tượng để phục hồi niềm tin xã hội.");
  }
  if (actions.length === 0) {
    actions.push("Duy trì lộ trình hiện tại nhưng tăng đánh giá tác động định lượng sau mỗi chu kỳ để tránh tự mãn.");
  }

  const style =
    avgGrowthPush >= 3 && avgEquityPush >= 3
      ? "Điều phối cân bằng chủ động"
      : avgGrowthPush >= 3 && avgEquityPush < 2
        ? "Thiên về tăng trưởng"
        : avgGrowthPush < 2 && avgEquityPush >= 3
          ? "Thiên về an sinh"
          : "Thận trọng trung tính";

  const intelligenceNote =
    overallScore >= 75
      ? "Bạn thể hiện tư duy hệ thống tốt: vừa xử lý mục tiêu ngắn hạn, vừa bảo toàn cấu trúc lợi ích dài hạn."
      : overallScore >= 55
        ? "Bạn có nền tảng điều phối khá, nhưng cần tăng độ chính xác trong cân bằng giữa hiệu quả thị trường và ổn định xã hội."
        : "Mô hình ra quyết định còn phản ứng theo tình huống, cần khung ưu tiên rõ hơn để tránh lệch pha hệ thống.";

  return {
    overallScore,
    grade: toBand(overallScore),
    style,
    intelligenceNote,
    roundsPlayed,
    dimensions: [
      { name: "Điều hướng vĩ mô", score: macroSteering, band: toBand(macroSteering) },
      { name: "Điều phối xã hội", score: socialCoordination, band: toBand(socialCoordination) },
      { name: "Năng lực thực thi", score: policyExecution, band: toBand(policyExecution) },
      { name: "Độ bền hệ thống", score: systemicResilience, band: toBand(systemicResilience) }
    ],
    strengths: strengths.length > 0 ? strengths : ["Bạn giữ được một số cân đối cơ bản nhưng chưa hình thành lợi thế điều phối nổi bật."],
    risks: risks.length > 0 ? risks : ["Rủi ro hệ thống đang ở mức kiểm soát được, chủ yếu cần duy trì kỷ luật thực thi."],
    actions
  };
}

const scenarioBriefings = {
  "Lao động nền tảng số": {
    deepContext:
      "Dữ liệu lao động phi chính thức năm 2025 cho thấy nhóm tài xế công nghệ chịu rủi ro thu nhập theo thuật toán phân phối cuốc, biến động giá xăng và thời tiết, nhưng chưa có lớp bảo vệ tương đương lao động hợp đồng truyền thống.",
    bullets: [
      "Tỷ lệ tham gia bảo hiểm xã hội tự nguyện của lao động nền tảng còn thấp do thu nhập dao động và tâm lý ngại thủ tục.",
      "Chi phí y tế, tai nạn nghề nghiệp và thời gian nghỉ ốm thường do cá nhân tự gánh.",
      "Nền tảng số muốn giữ linh hoạt vận hành, trong khi xã hội đòi hỏi chuẩn lao động tối thiểu."
    ]
  },
  "Tiền lương và năng suất": {
    deepContext:
      "Năm 2025, doanh nghiệp chế biến - chế tạo đối mặt cạnh tranh đơn hàng từ khu vực, còn người lao động đô thị chịu áp lực giá thuê nhà, học phí và thực phẩm khiến tiền lương thực tăng chậm.",
    bullets: [
      "Tăng lương nhanh có thể tác động chi phí sản xuất của doanh nghiệp nhỏ và doanh nghiệp thâm dụng lao động.",
      "Giữ lương thấp kéo dài có thể làm giảm tổng cầu tiêu dùng và tăng căng thẳng quan hệ lao động.",
      "Nâng năng suất thông qua đào tạo và tự động hóa là chìa khóa dung hòa hai phía."
    ]
  },
  "Nhà ở xã hội": {
    deepContext:
      "Các vành đai công nghiệp phía Bắc và phía Nam ghi nhận nhu cầu nhà ở công nhân tăng nhanh hơn tốc độ cung dự án, khiến chi phí thuê trọ chiếm tỷ trọng lớn trong thu nhập lao động phổ thông.",
    bullets: [
      "Thiếu nhà ở phù hợp làm tăng tình trạng nghỉ việc, chuyển việc theo mùa.",
      "Doanh nghiệp chịu chi phí ẩn từ biến động nhân sự và năng suất giảm.",
      "Chính sách đất đai, tín dụng và quy hoạch quyết định tốc độ cải thiện thực tế."
    ]
  },
  "Y tế công": {
    deepContext:
      "Cơ chế tự chủ bệnh viện công giúp mở rộng dịch vụ kỹ thuật cao, nhưng nếu thiếu bù đắp có mục tiêu sẽ làm nhóm thu nhập thấp bị hạn chế khả năng tiếp cận chăm sóc chất lượng.",
    bullets: [
      "Bảo hiểm y tế là trụ cột giúp giảm chi tiền túi của hộ gia đình.",
      "Giá dịch vụ tăng nhanh dễ tạo phản ứng xã hội nếu thiếu minh bạch cấu phần chi phí.",
      "Cải cách thành công cần song hành giữa hiệu quả tài chính và công bằng tiếp cận."
    ]
  },
  "Thị trường điện": {
    deepContext:
      "Nhu cầu điện sinh hoạt, sản xuất và dịch vụ cùng tăng trong mùa nắng nóng, đặt ra yêu cầu điều chỉnh giá theo hướng đủ nguồn lực đầu tư nhưng không gây sốc cho hộ thu nhập thấp.",
    bullets: [
      "Giá thấp dàn trải làm giảm động lực tiết kiệm điện và đầu tư tiết kiệm năng lượng.",
      "Tăng giá quá nhanh có thể lan sang chi phí sinh hoạt và lạm phát kỳ vọng.",
      "Hỗ trợ mục tiêu theo đối tượng giúp giảm méo mó chính sách."
    ]
  },
  "Nông nghiệp xuất khẩu": {
    deepContext:
      "Các rào cản kỹ thuật mới về truy xuất nguồn gốc, môi trường và phát thải đang tái định hình chuỗi nông sản xuất khẩu, đặc biệt với hợp tác xã và hộ nhỏ thiếu vốn chuyển đổi.",
    bullets: [
      "Nếu đáp ứng chuẩn mới, nông sản có cơ hội vào phân khúc giá trị cao hơn.",
      "Nếu chậm chuyển đổi, nguy cơ mất đơn hàng và giảm thu nhập nông thôn tăng mạnh.",
      "Vai trò Nhà nước là giảm chi phí chuyển đổi ban đầu cho tác nhân yếu thế."
    ]
  },
  "Tham nhũng và mua sắm công": {
    deepContext:
      "Sai lệch trong mua sắm công không chỉ gây thất thoát ngân sách mà còn làm giảm chất lượng dịch vụ công và phá vỡ niềm tin vào công bằng thể chế.",
    bullets: [
      "Công khai dữ liệu đấu thầu giúp tăng giám sát xã hội và giảm thông đồng.",
      "Xử lý không đủ mạnh làm tăng kỳ vọng trục lợi trong tương lai.",
      "Kỷ cương tốt giúp giảm chi phí phát triển dài hạn."
    ]
  },
  "Thương mại điện tử": {
    deepContext:
      "Quy mô thương mại điện tử tăng nhanh, nhưng chênh lệch quyền lực giữa nền tảng lớn và người bán nhỏ khiến nhiều hộ kinh doanh đối mặt chi phí cao, chính sách phạt và khóa gian hàng thiếu minh bạch.",
    bullets: [
      "Minh bạch cấu phần phí giúp người bán dự báo dòng tiền tốt hơn.",
      "Thiếu cơ chế giải quyết tranh chấp làm tăng rủi ro cho hộ nhỏ.",
      "Cạnh tranh lành mạnh trên nền tảng số cần khung quản trị phù hợp."
    ]
  },
  "Phát triển vùng": {
    deepContext:
      "Đô thị lõi tiếp tục là đầu tàu tăng trưởng, nhưng khoảng cách hạ tầng, dịch vụ công và cơ hội việc làm với vùng vệ tinh tạo áp lực di cư và bất cân đối phát triển.",
    bullets: [
      "Đầu tư có trọng tâm cho vùng yếu có thể giảm chi phí xã hội do di cư bắt buộc.",
      "Dàn trải nguồn lực dễ giảm hiệu quả đầu tư công.",
      "Chính sách cân bằng vùng cần gắn với năng suất và kết nối thị trường."
    ]
  }
};

const scenarioSchedule = {
  "Lao động nền tảng số": {
    eventDate: "2025-04-15",
    context: "sau cao điểm nhu cầu giao nhận đô thị"
  },
  "Tiền lương và năng suất": {
    eventDate: "2025-05-20",
    context: "trước kỳ thương lượng lương tối thiểu vùng"
  },
  "Nhà ở xã hội": {
    eventDate: "2025-06-10",
    context: "khi khu công nghiệp mở rộng tuyển dụng mùa cao điểm"
  },
  "Y tế công": {
    eventDate: "2025-07-08",
    context: "sau đợt điều chỉnh khung giá dịch vụ y tế"
  },
  "Thị trường điện": {
    eventDate: "2025-06-25",
    context: "giai đoạn phụ tải điện mùa nóng tăng mạnh"
  },
  "Nông nghiệp xuất khẩu": {
    eventDate: "2025-09-05",
    context: "khi thị trường nhập khẩu siết chuẩn phát thải"
  },
  "Tham nhũng và mua sắm công": {
    eventDate: "2025-08-19",
    context: "sau kết luận thanh tra chuyên đề mua sắm công"
  },
  "Thương mại điện tử": {
    eventDate: "2025-06-28",
    context: "sau đợt điều chỉnh phí và hiển thị của nhiều sàn"
  },
  "Phát triển vùng": {
    eventDate: "2025-10-01",
    context: "kỳ chốt phương án phân bổ đầu tư công trung hạn"
  }
};

function formatDateVN(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addMonths(isoDate, months) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const theoryCore = [
  "Quan hệ lợi ích kinh tế là quan hệ phân phối và hưởng lợi giữa Nhà nước, doanh nghiệp, người lao động và cộng đồng.",
  "Hệ thống lợi ích gồm ba tầng: cá nhân, tập thể, xã hội; cần đặt trong một thể chế minh bạch và có trách nhiệm giải trình.",
  "Kinh tế tư nhân là động lực quan trọng, nhưng phải gắn với trách nhiệm xã hội, tuân thủ pháp luật và cạnh tranh lành mạnh.",
  "Vai trò điều tiết của Nhà nước thể hiện qua thuế, ngân sách, luật lao động, an sinh và chống lợi ích nhóm.",
  "Quan hệ biện chứng: nếu lợi ích nhóm lấn át lợi ích chung, niềm tin xã hội giảm, chi phí phát triển dài hạn tăng mạnh."
];

const scenarioBank = [
  {
    type: "Lao động nền tảng số",
    title: "Tài xế công nghệ tăng nhanh nhưng thiếu lưới an sinh",
    text: "Năm 2025, lực lượng tài xế công nghệ và giao hàng tiếp tục tăng. Nhiều người phản ánh không được hỗ trợ bảo hiểm, nghỉ ốm và quyền thương lượng như lao động thông thường.",
    choices: [
      {
        title: "Áp dụng gói an sinh tối thiểu cho lao động nền tảng",
        note: "Yêu cầu doanh nghiệp nền tảng cùng đóng góp bảo hiểm tai nạn và bảo hiểm xã hội tự nguyện có hỗ trợ.",
        effects: { growth: 4, equity: 12, trust: 10, regulation: 9, innovation: 3 },
        moods: {
          citizen: { tone: "good", text: "Người dân thấy thị trường lao động số công bằng hơn." },
          worker: { tone: "good", text: "Tài xế yên tâm vì có điểm tựa khi rủi ro." },
          business: { tone: "neutral", text: "Doanh nghiệp tăng chi phí nhưng ổn định lực lượng vận hành." },
          state: { tone: "good", text: "Nhà nước củng cố quản trị lao động trong kinh tế số." }
        },
        theory: "Điều tiết đúng giúp lợi ích của doanh nghiệp nền tảng không tách rời quyền lợi chính đáng của người lao động."
      },
      {
        title: "Khuyến khích tự thỏa thuận hoàn toàn giữa nền tảng và tài xế",
        note: "Giữ thị trường linh hoạt tối đa, giảm can thiệp chính sách.",
        effects: { growth: 7, equity: -8, trust: -9, regulation: -6, innovation: 4 },
        moods: {
          citizen: { tone: "bad", text: "Dư luận lo ngại bất bình đẳng trong lao động số." },
          worker: { tone: "bad", text: "Tài xế cảm thấy thu nhập bấp bênh và thiếu bảo vệ." },
          business: { tone: "good", text: "Nền tảng dễ mở rộng quy mô nhanh." },
          state: { tone: "neutral", text: "Nhà nước tăng trưởng ngắn hạn nhưng rủi ro xã hội cao." }
        },
        theory: "Thị trường lao động linh hoạt nếu thiếu khung bảo vệ sẽ dễ chuyển rủi ro sang nhóm yếu thế."
      },
      {
        title: "Thí điểm quỹ phúc lợi ngành gọi xe tại đô thị lớn",
        note: "Hà Nội, TP.HCM triển khai trước; đánh giá rồi nhân rộng.",
        effects: { growth: 5, equity: 8, trust: 8, regulation: 7, innovation: 5 },
        moods: {
          citizen: { tone: "good", text: "Xã hội đánh giá cao cách làm từng bước có kiểm chứng." },
          worker: { tone: "good", text: "Tài xế có tín hiệu cải thiện thực chất." },
          business: { tone: "neutral", text: "Doanh nghiệp chấp nhận vì lộ trình rõ ràng." },
          state: { tone: "good", text: "Nhà nước kiểm soát tốt chi phí chính sách và rủi ro thực thi." }
        },
        theory: "Thí điểm chính sách là cách dung hòa đổi mới và công bằng trong bối cảnh mô hình lao động mới."
      }
    ]
  },
  {
    type: "Tiền lương và năng suất",
    title: "Điều chỉnh lương tối thiểu vùng 2025",
    text: "Lạm phát và chi phí sinh hoạt tại các đô thị tăng. Công đoàn đề xuất tăng lương tối thiểu, trong khi doanh nghiệp xuất khẩu lo ngại mất đơn hàng.",
    choices: [
      {
        title: "Tăng lương theo lộ trình kèm gói nâng năng suất",
        note: "Hỗ trợ doanh nghiệp nhỏ chuyển đổi số và đào tạo kỹ năng.",
        effects: { growth: 5, equity: 10, trust: 9, regulation: 6, innovation: 5 },
        moods: {
          citizen: { tone: "good", text: "Người dân thấy chính sách cân bằng và khả thi." },
          worker: { tone: "good", text: "Người lao động được cải thiện thu nhập thực." },
          business: { tone: "neutral", text: "Doanh nghiệp có áp lực nhưng có công cụ thích nghi." },
          state: { tone: "good", text: "Nhà nước duy trì ổn định quan hệ lao động." }
        },
        theory: "Kết hợp phân phối thu nhập với nâng năng suất giúp lợi ích các bên dịch chuyển theo hướng cùng thắng."
      },
      {
        title: "Giữ nguyên lương tối thiểu thêm 1 năm",
        note: "Ưu tiên giữ chi phí đầu vào để bảo vệ đơn hàng xuất khẩu.",
        effects: { growth: 6, equity: -7, trust: -8, regulation: -2, innovation: 1 },
        moods: {
          citizen: { tone: "bad", text: "Dư luận lo thu nhập người làm công không theo kịp giá cả." },
          worker: { tone: "bad", text: "Người lao động hụt kỳ vọng cải thiện đời sống." },
          business: { tone: "good", text: "Doanh nghiệp giữ được biên chi phí ngắn hạn." },
          state: { tone: "neutral", text: "Nhà nước đối mặt áp lực an sinh và đối thoại xã hội." }
        },
        theory: "Tăng trưởng không đi kèm phân phối hợp lý có thể làm suy yếu đồng thuận phát triển."
      },
      {
        title: "Tăng mạnh ngay lập tức trên toàn quốc",
        note: "Ưu tiên cải thiện thu nhập nhanh cho người làm công ăn lương.",
        effects: { growth: -4, equity: 11, trust: 7, regulation: 2, innovation: -3 },
        moods: {
          citizen: { tone: "good", text: "Xã hội đánh giá cao ưu tiên đời sống lao động." },
          worker: { tone: "good", text: "Người lao động hài lòng trong ngắn hạn." },
          business: { tone: "bad", text: "Doanh nghiệp nhỏ lo cắt giảm tuyển dụng." },
          state: { tone: "neutral", text: "Nhà nước cần thêm gói chuyển đổi để giảm sốc chi phí." }
        },
        theory: "Điều tiết thiếu nhịp độ dễ tạo tác dụng phụ lên việc làm và sức cạnh tranh."
      }
    ]
  },
  {
    type: "Nhà ở xã hội",
    title: "Công nhân khu công nghiệp thiếu nhà ở phù hợp",
    text: "Nhu cầu nhà ở xã hội tăng mạnh tại các vành đai công nghiệp. Nhiều lao động vẫn thuê trọ chất lượng thấp, chi phí cao.",
    choices: [
      {
        title: "Ràng buộc dự án lớn dành quỹ đất nhà ở công nhân",
        note: "Kết hợp ưu đãi tín dụng và chuẩn hạ tầng tối thiểu.",
        effects: { growth: 5, equity: 11, trust: 10, regulation: 8, innovation: 3 },
        moods: {
          citizen: { tone: "good", text: "Người dân tin chính sách đi vào nhu cầu thật." },
          worker: { tone: "good", text: "Lao động yên tâm an cư để ổn định việc làm." },
          business: { tone: "neutral", text: "Doanh nghiệp tăng nghĩa vụ nhưng giảm biến động lao động." },
          state: { tone: "good", text: "Nhà nước nâng hiệu quả liên kết giữa an sinh và tăng trưởng." }
        },
        theory: "Lợi ích xã hội được bảo đảm tốt sẽ quay lại hỗ trợ năng suất và sức chống chịu của thị trường lao động."
      },
      {
        title: "Trợ cấp tiền thuê ngắn hạn",
        note: "Giải quyết trước mắt, chưa can thiệp cấu trúc nguồn cung.",
        effects: { growth: 2, equity: 6, trust: 5, regulation: 1, innovation: -1 },
        moods: {
          citizen: { tone: "neutral", text: "Có hỗ trợ nhưng chưa chạm gốc vấn đề." },
          worker: { tone: "good", text: "Người lao động đỡ áp lực tài chính tức thời." },
          business: { tone: "neutral", text: "Doanh nghiệp hưởng lợi gián tiếp từ ổn định nhân sự." },
          state: { tone: "neutral", text: "Nhà nước cần tiếp tục cải cách nguồn cung nhà ở." }
        },
        theory: "Chính sách ngắn hạn cần gắn với giải pháp cấu trúc để tránh lệ thuộc trợ cấp."
      },
      {
        title: "Để thị trường tự điều chỉnh hoàn toàn",
        note: "Giảm vai trò điều phối của Nhà nước trong phân khúc nhà ở xã hội.",
        effects: { growth: 4, equity: -8, trust: -8, regulation: -5, innovation: 1 },
        moods: {
          citizen: { tone: "bad", text: "Nhiều hộ thu nhập thấp bị bỏ lại phía sau." },
          worker: { tone: "bad", text: "Công nhân tiếp tục chịu chi phí sống cao." },
          business: { tone: "good", text: "Một số chủ đầu tư có biên lợi nhuận tốt hơn." },
          state: { tone: "bad", text: "Nhà nước đối mặt mâu thuẫn xã hội tại đô thị công nghiệp." }
        },
        theory: "Với hàng hóa thiết yếu, thiếu điều tiết có thể làm chênh lệch lợi ích tăng nhanh và kéo dài."
      }
    ]
  },
  {
    type: "Y tế công",
    title: "Bệnh viện công tự chủ tài chính và áp lực viện phí",
    text: "Một số bệnh viện công tăng mức thu dịch vụ theo cơ chế tự chủ. Người thu nhập thấp lo ngại khó tiếp cận khám chữa bệnh chất lượng.",
    choices: [
      {
        title: "Giữ tự chủ nhưng bổ sung quỹ bù chéo cho nhóm yếu thế",
        note: "Mở rộng thanh toán bảo hiểm y tế và công khai giá dịch vụ.",
        effects: { growth: 4, equity: 10, trust: 9, regulation: 8, innovation: 4 },
        moods: {
          citizen: { tone: "good", text: "Người dân thấy công bằng tiếp cận dịch vụ thiết yếu." },
          worker: { tone: "good", text: "Người lao động yên tâm hơn về rủi ro sức khỏe." },
          business: { tone: "neutral", text: "Doanh nghiệp chấp nhận khi nhân lực ổn định sức khỏe." },
          state: { tone: "good", text: "Nhà nước cân bằng hiệu quả tài chính và công bằng xã hội." }
        },
        theory: "Nhà nước điều tiết để thị trường dịch vụ công vận hành hiệu quả mà không loại trừ nhóm dễ tổn thương."
      },
      {
        title: "Ưu tiên tự chủ tối đa, giảm hỗ trợ ngân sách",
        note: "Đẩy mạnh cơ chế giá dịch vụ theo chi phí thực.",
        effects: { growth: 5, equity: -7, trust: -7, regulation: -3, innovation: 3 },
        moods: {
          citizen: { tone: "bad", text: "Nhiều người lo viện phí vượt khả năng chi trả." },
          worker: { tone: "bad", text: "Lao động phổ thông sợ rủi ro chi phí y tế." },
          business: { tone: "good", text: "Một số nhà cung ứng dịch vụ y tế mở rộng nhanh." },
          state: { tone: "neutral", text: "Nhà nước phải xử lý phản ứng xã hội gia tăng." }
        },
        theory: "Nếu chi phí tiếp cận dịch vụ công tăng quá mức, bất bình đẳng lợi ích sẽ chuyển thành mâu thuẫn xã hội."
      },
      {
        title: "Tạm dừng tự chủ để rà soát toàn diện",
        note: "Ưu tiên ổn định tâm lý xã hội và đánh giá tác động.",
        effects: { growth: -2, equity: 6, trust: 6, regulation: 5, innovation: -2 },
        moods: {
          citizen: { tone: "good", text: "Người dân thấy tiếng nói của mình được lắng nghe." },
          worker: { tone: "neutral", text: "Tạm ổn trước mắt nhưng chờ cải cách dài hạn." },
          business: { tone: "bad", text: "Đơn vị cung ứng lo giảm động lực đầu tư cải tiến." },
          state: { tone: "neutral", text: "Nhà nước có thêm thời gian hoàn thiện cơ chế giá." }
        },
        theory: "Điều tiết bền vững cần vừa bảo vệ dân sinh vừa duy trì động lực cải tiến dịch vụ công."
      }
    ]
  },
  {
    type: "Thị trường điện",
    title: "Giá điện sinh hoạt và chuyển dịch năng lượng",
    text: "Nhu cầu điện tăng cao trong mùa nóng 2025. Câu hỏi đặt ra là điều chỉnh biểu giá điện thế nào để vừa khuyến khích tiết kiệm, vừa bảo vệ hộ thu nhập thấp.",
    choices: [
      {
        title: "Giá điện lũy tiến + hỗ trợ trực tiếp hộ nghèo",
        note: "Tăng minh bạch chi phí, trợ giá mục tiêu thay vì dàn trải.",
        effects: { growth: 4, equity: 9, trust: 8, regulation: 9, innovation: 5 },
        moods: {
          citizen: { tone: "good", text: "Hộ thu nhập thấp cảm thấy được bảo vệ rõ ràng." },
          worker: { tone: "good", text: "Chi phí sinh hoạt được kiểm soát công bằng hơn." },
          business: { tone: "neutral", text: "Doanh nghiệp thích nghi với tín hiệu giá rõ ràng." },
          state: { tone: "good", text: "Nhà nước tăng hiệu lực điều tiết và kỷ luật ngân sách." }
        },
        theory: "Điều tiết theo mục tiêu giúp hài hòa lợi ích giữa hiệu quả thị trường và công bằng phân phối."
      },
      {
        title: "Giữ giá bình quân thấp cho mọi nhóm",
        note: "Ổn định tức thời, chưa phân tách đối tượng thụ hưởng.",
        effects: { growth: 2, equity: 2, trust: 3, regulation: -4, innovation: -3 },
        moods: {
          citizen: { tone: "neutral", text: "Ngắn hạn dễ chịu nhưng chưa công bằng theo nhu cầu." },
          worker: { tone: "neutral", text: "Lao động đỡ áp lực chi phí điện trước mắt." },
          business: { tone: "good", text: "Doanh nghiệp hưởng lợi từ giá đầu vào thấp." },
          state: { tone: "bad", text: "Nhà nước chịu gánh nặng bù chéo và kém động lực tiết kiệm điện." }
        },
        theory: "Bao cấp dàn trải có thể tạo méo mó tín hiệu giá và giảm hiệu quả phân bổ nguồn lực."
      },
      {
        title: "Tăng giá nhanh theo chi phí thị trường",
        note: "Ưu tiên tài chính ngành điện và đầu tư mới.",
        effects: { growth: -3, equity: -7, trust: -8, regulation: 3, innovation: 4 },
        moods: {
          citizen: { tone: "bad", text: "Người dân phản ứng vì chi phí điện tăng đột ngột." },
          worker: { tone: "bad", text: "Lao động thu nhập thấp chịu ảnh hưởng nặng." },
          business: { tone: "neutral", text: "Doanh nghiệp lo chi phí sản xuất tăng nhanh." },
          state: { tone: "neutral", text: "Nhà nước cần thêm gói giảm sốc cho nhóm dễ tổn thương." }
        },
        theory: "Cải cách giá cần có nhịp độ và cơ chế bù đắp để tránh chuyển toàn bộ gánh nặng sang dân cư."
      }
    ]
  },
  {
    type: "Nông nghiệp xuất khẩu",
    title: "Nông sản vào EU bị siết chuẩn phát thải",
    text: "Một số thị trường nhập khẩu yêu cầu truy xuất nguồn gốc và tiêu chuẩn phát thải cao hơn. Hợp tác xã nhỏ gặp khó về vốn và công nghệ đáp ứng chuẩn mới.",
    choices: [
      {
        title: "Quỹ chuyển đổi xanh cho hợp tác xã và hộ nhỏ",
        note: "Hỗ trợ tín dụng ưu đãi, chứng nhận số và đào tạo kỹ thuật.",
        effects: { growth: 6, equity: 9, trust: 8, regulation: 7, innovation: 8 },
        moods: {
          citizen: { tone: "good", text: "Người dân tin vào chiến lược xuất khẩu bền vững." },
          worker: { tone: "good", text: "Nông hộ có cơ hội giữ thị trường và tăng thu nhập." },
          business: { tone: "good", text: "Doanh nghiệp xuất khẩu có nguồn cung đạt chuẩn ổn định." },
          state: { tone: "good", text: "Nhà nước kết hợp được mục tiêu tăng trưởng và môi trường." }
        },
        theory: "Điều tiết thông minh giúp nhóm yếu hơn tham gia chuỗi giá trị cao thay vì bị loại khỏi thị trường."
      },
      {
        title: "Để doanh nghiệp tự sàng lọc nhà cung ứng",
        note: "Ưu tiên hiệu quả thương mại ngắn hạn.",
        effects: { growth: 5, equity: -6, trust: -5, regulation: -3, innovation: 4 },
        moods: {
          citizen: { tone: "bad", text: "Nhiều địa phương lo nông hộ nhỏ bị gạt khỏi chuỗi cung ứng." },
          worker: { tone: "bad", text: "Nông dân nhỏ thiếu khả năng tự nâng chuẩn." },
          business: { tone: "good", text: "Doanh nghiệp lớn tăng lợi thế thị phần." },
          state: { tone: "neutral", text: "Nhà nước chịu áp lực vùng miền và an sinh nông thôn." }
        },
        theory: "Khi rào cản thị trường tăng, thiếu chính sách hỗ trợ sẽ làm khoảng cách lợi ích giữa nhóm lớn và nhóm nhỏ nới rộng."
      },
      {
        title: "Gia hạn thời gian đáp ứng chuẩn thêm 2 năm",
        note: "Giảm áp lực tức thời nhưng chậm nâng chất lượng.",
        effects: { growth: 1, equity: 4, trust: 3, regulation: 2, innovation: -2 },
        moods: {
          citizen: { tone: "neutral", text: "Xã hội tạm yên tâm nhưng lo mất cơ hội thị trường." },
          worker: { tone: "neutral", text: "Nông hộ có thêm thời gian nhưng thiếu động lực đổi mới." },
          business: { tone: "neutral", text: "Doanh nghiệp trì hoãn đầu tư chuyển đổi sâu." },
          state: { tone: "neutral", text: "Nhà nước cần lộ trình rõ để tránh tụt chuẩn cạnh tranh." }
        },
        theory: "Trì hoãn có kiểm soát chỉ hữu ích khi đi kèm kế hoạch nâng năng lực thực chất."
      }
    ]
  },
  {
    type: "Tham nhũng và mua sắm công",
    title: "Phát hiện dấu hiệu thông đồng đấu thầu thiết bị công",
    text: "Cơ quan thanh tra phát hiện dấu hiệu thông đồng trong một số gói thầu mua sắm công. Xử lý thế nào để vừa nghiêm minh vừa không làm gián đoạn dịch vụ thiết yếu?",
    choices: [
      {
        title: "Tạm dừng gói nghi vấn, đấu thầu lại công khai",
        note: "Mở dữ liệu đấu thầu, tăng kiểm toán độc lập.",
        effects: { growth: 2, equity: 11, trust: 13, regulation: 12, innovation: 2 },
        moods: {
          citizen: { tone: "good", text: "Niềm tin công chúng tăng rõ rệt." },
          worker: { tone: "good", text: "Người lao động kỳ vọng môi trường minh bạch hơn." },
          business: { tone: "neutral", text: "Doanh nghiệp làm thật được bảo vệ công bằng." },
          state: { tone: "good", text: "Nhà nước củng cố năng lực pháp quyền." }
        },
        theory: "Chống tham nhũng là điều kiện tiên quyết để lợi ích kinh tế vận hành theo hướng phát triển chung."
      },
      {
        title: "Xử lý nội bộ kín để giữ tiến độ",
        note: "Tránh tác động truyền thông ngắn hạn.",
        effects: { growth: 5, equity: -9, trust: -11, regulation: -10, innovation: -1 },
        moods: {
          citizen: { tone: "bad", text: "Dư luận nghi ngờ có bao che lợi ích nhóm." },
          worker: { tone: "bad", text: "Người lao động giảm niềm tin vào công bằng thể chế." },
          business: { tone: "good", text: "Nhóm thân hữu hưởng lợi từ thiếu minh bạch." },
          state: { tone: "bad", text: "Uy tín điều hành của Nhà nước suy giảm." }
        },
        theory: "Thiếu minh bạch khiến lợi ích riêng dễ biến thành đặc quyền, làm méo mó phân bổ nguồn lực công."
      },
      {
        title: "Phạt hành chính nhẹ để tiếp tục triển khai",
        note: "Ưu tiên ít xáo trộn dự án.",
        effects: { growth: 4, equity: -6, trust: -7, regulation: -5, innovation: 0 },
        moods: {
          citizen: { tone: "bad", text: "Người dân thấy mức xử lý chưa tương xứng." },
          worker: { tone: "neutral", text: "Lao động chưa thấy thay đổi hệ thống rõ rệt." },
          business: { tone: "good", text: "Nhóm vi phạm cảm nhận rủi ro thấp." },
          state: { tone: "neutral", text: "Nhà nước giữ tiến độ nhưng giảm sức răn đe." }
        },
        theory: "Chế tài yếu làm sai lệch động cơ thị trường và làm tăng chi phí xã hội về dài hạn."
      }
    ]
  },
  {
    type: "Thương mại điện tử",
    title: "Người bán nhỏ lép vế trên sàn thương mại điện tử",
    text: "Doanh thu online tăng mạnh nhưng hộ kinh doanh nhỏ phản ánh phí nền tảng và khuyến mại bắt buộc cao, khó duy trì lợi nhuận.",
    choices: [
      {
        title: "Áp chuẩn minh bạch phí sàn và cơ chế giải quyết tranh chấp",
        note: "Công khai cấu phần phí, thời hạn thanh toán, tiêu chí khóa gian hàng.",
        effects: { growth: 5, equity: 9, trust: 9, regulation: 8, innovation: 5 },
        moods: {
          citizen: { tone: "good", text: "Người tiêu dùng và người bán tin vào sân chơi công bằng hơn." },
          worker: { tone: "good", text: "Hộ kinh doanh có thêm cơ hội bền vững." },
          business: { tone: "neutral", text: "Sàn thương mại điện tử tăng chi phí tuân thủ nhưng ổn định hệ sinh thái." },
          state: { tone: "good", text: "Nhà nước tăng hiệu lực quản lý kinh tế số." }
        },
        theory: "Minh bạch luật chơi giúp giảm bất cân xứng quyền lực giữa nền tảng lớn và tác nhân nhỏ."
      },
      {
        title: "Ưu tiên tự điều chỉnh của nền tảng",
        note: "Giữ tốc độ tăng trưởng giao dịch ngắn hạn.",
        effects: { growth: 7, equity: -6, trust: -6, regulation: -5, innovation: 4 },
        moods: {
          citizen: { tone: "bad", text: "Nhiều người lo thị trường thiếu bảo vệ bên yếu thế." },
          worker: { tone: "bad", text: "Hộ nhỏ tiếp tục bị ép biên lợi nhuận." },
          business: { tone: "good", text: "Nền tảng lớn dễ tối ưu doanh thu." },
          state: { tone: "neutral", text: "Nhà nước đạt tăng trưởng giao dịch nhưng áp lực khiếu nại tăng." }
        },
        theory: "Khi quyền lực thị trường tập trung, điều tiết cạnh tranh là điều kiện để bảo toàn lợi ích xã hội."
      },
      {
        title: "Trợ cấp trực tiếp cho người bán nhỏ",
        note: "Hỗ trợ marketing và logistics từ ngân sách công.",
        effects: { growth: 2, equity: 7, trust: 6, regulation: 1, innovation: -1 },
        moods: {
          citizen: { tone: "neutral", text: "Có hỗ trợ nhưng lo tính bền vững ngân sách." },
          worker: { tone: "good", text: "Người bán nhỏ giảm áp lực ngắn hạn." },
          business: { tone: "neutral", text: "Sàn lớn không bị tác động cấu trúc phí." },
          state: { tone: "neutral", text: "Nhà nước cần tránh phụ thuộc trợ cấp kéo dài." }
        },
        theory: "Hỗ trợ tài chính chỉ hiệu quả khi đi cùng cải cách thể chế thị trường nền tảng."
      }
    ]
  },
  {
    type: "Phát triển vùng",
    title: "Cân bằng đầu tư giữa đô thị lõi và địa phương vệ tinh",
    text: "Khu vực đô thị lõi đóng góp GDP lớn, trong khi nhiều địa phương vệ tinh cần hạ tầng số, logistics và y tế để giữ lao động chất lượng.",
    choices: [
      {
        title: "Phân bổ theo chỉ số phát triển cân bằng vùng",
        note: "Giữ động lực đầu tàu nhưng tăng đầu tư mục tiêu cho vùng yếu hơn.",
        effects: { growth: 5, equity: 10, trust: 8, regulation: 7, innovation: 4 },
        moods: {
          citizen: { tone: "good", text: "Người dân thấy cơ hội tiếp cận dịch vụ công đồng đều hơn." },
          worker: { tone: "good", text: "Lao động địa phương có thêm lựa chọn việc làm tại chỗ." },
          business: { tone: "neutral", text: "Doanh nghiệp điều chỉnh chiến lược phân bố đầu tư." },
          state: { tone: "good", text: "Nhà nước tăng kết nối thị trường nội địa." }
        },
        theory: "Hài hòa lợi ích không phải chia đều cơ học, mà là phân bổ theo mục tiêu công bằng có hiệu quả."
      },
      {
        title: "Tập trung tối đa cho đô thị đầu tàu",
        note: "Ưu tiên tăng trưởng GDP ngắn hạn cao nhất.",
        effects: { growth: 9, equity: -8, trust: -6, regulation: -2, innovation: 6 },
        moods: {
          citizen: { tone: "bad", text: "Khu vực ngoài lõi cảm thấy bị bỏ lại phía sau." },
          worker: { tone: "neutral", text: "Di cư lao động tăng, áp lực an sinh đô thị lớn." },
          business: { tone: "good", text: "Doanh nghiệp ở trung tâm hưởng lợi mạnh." },
          state: { tone: "neutral", text: "Nhà nước có tăng trưởng cao nhưng phân hóa xã hội tăng." }
        },
        theory: "Tăng trưởng cực hóa nếu thiếu điều tiết sẽ làm rạn nứt nền tảng đồng thuận xã hội."
      },
      {
        title: "Chia đều ngân sách cho tất cả địa phương",
        note: "Đảm bảo công bằng hình thức giữa các tỉnh.",
        effects: { growth: -3, equity: 4, trust: 3, regulation: 2, innovation: -3 },
        moods: {
          citizen: { tone: "neutral", text: "Có cảm giác công bằng nhưng hiệu quả đầu tư chưa rõ." },
          worker: { tone: "neutral", text: "Cải thiện có nhưng thiếu đột phá năng suất." },
          business: { tone: "bad", text: "Doanh nghiệp lo nguồn lực bị dàn trải." },
          state: { tone: "neutral", text: "Nhà nước dễ quản lý ngắn hạn nhưng khó tạo bứt phá." }
        },
        theory: "Công bằng bền vững cần gắn với năng suất sử dụng nguồn lực, không chỉ bình quân theo đầu mối hành chính."
      }
    ]
  }
];

const baseMoods = {
  citizen: { tone: "neutral", text: "Đang chờ quyết định..." },
  worker: { tone: "neutral", text: "Đang chờ quyết định..." },
  business: { tone: "neutral", text: "Đang chờ quyết định..." },
  state: { tone: "neutral", text: "Đang theo dõi..." }
};

const baseNotes = [
  "Khởi động nhiệm kỳ: ưu tiên tăng trưởng bao trùm và giảm xung đột lợi ích.",
  "Nguyên tắc game: mỗi quyết sách cần cân bằng lợi ích Nhà nước - doanh nghiệp - người lao động - cộng đồng."
];

function pickScenarioSet() {
  const shuffled = [...scenarioBank];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, MAX_ROUNDS);
}

function statColor(value) {
  if (value < 35) return "#c24739";
  if (value < 60) return "#f3a521";
  return "#1e9a73";
}

function getEnding(stats) {
  if (stats.growth >= 65 && stats.equity >= 60 && stats.trust >= 60 && stats.regulation >= 60) {
    return {
      title: "KẾT CỤC A: PHÁT TRIỂN HÀI HÒA",
      text: "Bạn đã biến lợi ích kinh tế thành động lực chung. Tăng trưởng được giữ cùng với công bằng, niềm tin và kỷ cương thể chế.",
      bullets: [
        "Lợi ích cá nhân được khuyến khích nhưng không tách rời lợi ích công.",
        "Khu vực tư nhân phát triển trong khung cạnh tranh minh bạch.",
        "Nhà nước thực hiện tốt vai trò kiến tạo và điều tiết."
      ]
    };
  }

  if (stats.growth >= 70 && (stats.equity < 45 || stats.trust < 45)) {
    return {
      title: "KẾT CỤC B: TĂNG TRƯỞNG LỆCH PHA",
      text: "Nền kinh tế tăng nhanh nhưng bất bình đẳng và nghi ngờ xã hội gia tăng. Lợi ích nhóm bắt đầu lấn át lợi ích toàn dân.",
      bullets: [
        "Động lực ngắn hạn cao nhưng rủi ro xung đột xã hội tăng.",
        "Cần tăng điều tiết về lao động, thuế và cạnh tranh công bằng.",
        "Phải ưu tiên minh bạch để phục hồi niềm tin."
      ]
    };
  }

  if (stats.equity >= 70 && stats.growth < 45) {
    return {
      title: "KẾT CỤC C: BẢO TRỢ QUÁ MỨC",
      text: "Công bằng ngắn hạn được cải thiện nhưng nền tảng năng suất và đổi mới chưa đủ mạnh, khiến tăng trưởng chậm lại.",
      bullets: [
        "Cần kết hợp an sinh với nâng cao năng suất lao động.",
        "Ưu đãi cần gắn KPI rõ ràng để tạo giá trị mới.",
        "Điều tiết hiệu quả là cân bằng giữa hỗ trợ và động lực."
      ]
    };
  }

  return {
    title: "KẾT CỤC D: CÂN BẰNG MONG MANH",
    text: "Bạn giữ được một phần cân bằng, nhưng một số mặt trận vẫn bất ổn. Đây là lúc cần cải cách thể chế sâu hơn.",
    bullets: [
      "Tăng trưởng, công bằng và niềm tin phải đi cùng nhau.",
      "Quan hệ biện chứng cá nhân - tập thể - xã hội cần được xử lý đồng bộ.",
      "Nhà nước cần nâng cao chất lượng dự báo và giám sát chính sách."
    ]
  };
}

function getCollapseResult(stats) {
  const alerts = [];

  if (stats.trust <= 18) {
    alerts.push("Niềm tin xã hội giảm xuống mức rất thấp, xung đột lợi ích bùng phát.");
  }
  if (stats.equity <= 18) {
    alerts.push("Công bằng phân phối suy giảm nghiêm trọng, khoảng cách lợi ích vượt ngưỡng chịu đựng.");
  }
  if (stats.regulation <= 18) {
    alerts.push("Năng lực điều tiết của Nhà nước suy yếu, chính sách mất hiệu lực thực thi.");
  }
  if (stats.growth <= 15) {
    alerts.push("Tăng trưởng rơi vào trạng thái đình trệ sâu, nền kinh tế mất động lực phục hồi.");
  }

  const imbalance = Math.abs(stats.growth - stats.equity);
  if (imbalance >= 50) {
    alerts.push("Lệch pha tăng trưởng - công bằng quá lớn, hệ thống phát triển bị vỡ cân bằng.");
  }

  if (alerts.length === 0) {
    return null;
  }

  return {
    title: "THẤT BẠI: KINH TẾ MẤT ĐIỀU HÒA",
    text: "Bạn đã để hệ thống lợi ích mất cân bằng nghiêm trọng. Nền kinh tế rơi vào trạng thái rạn vỡ và chiến dịch phải dừng sớm.",
    bullets: alerts
  };
}

function createNewCampaignState() {
  return {
    round: 0,
    stats: initialStats,
    score: 0,
    notes: baseNotes,
    moods: baseMoods,
    scenarios: pickScenarioSet(),
    collapse: null,
    pendingDecision: null,
    decisionLog: []
  };
}

function loadSavedCampaign() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (!Array.isArray(parsed.scenarios) || typeof parsed.round !== "number") {
      return null;
    }

    return {
      round: parsed.round,
      stats: parsed.stats || initialStats,
      score: typeof parsed.score === "number" ? parsed.score : 0,
      notes: Array.isArray(parsed.notes) ? parsed.notes : baseNotes,
      moods: parsed.moods || baseMoods,
      scenarios: parsed.scenarios,
      collapse: parsed.collapse,
      pendingDecision: parsed.pendingDecision,
      decisionLog: Array.isArray(parsed.decisionLog) ? parsed.decisionLog : []
    };
  } catch {
    return null;
  }
}

function clearSavedCampaign() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SAVE_KEY);
  }
}

export default function App() {
  const [initialCampaign] = useState(() => loadSavedCampaign() || createNewCampaignState());
  const [round, setRound] = useState(initialCampaign.round);
  const [stats, setStats] = useState(initialCampaign.stats);
  const [score, setScore] = useState(initialCampaign.score);
  const [notes, setNotes] = useState(initialCampaign.notes);
  const [moods, setMoods] = useState(initialCampaign.moods);
  const [scenarios, setScenarios] = useState(initialCampaign.scenarios);
  const [collapse, setCollapse] = useState(initialCampaign.collapse);
  const [pendingDecision, setPendingDecision] = useState(initialCampaign.pendingDecision);
  const [decisionLog, setDecisionLog] = useState(initialCampaign.decisionLog || []);
  const [confirmChoice, setConfirmChoice] = useState(null);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState(initialCampaign.round > 0 || initialCampaign.pendingDecision ? "Đã khôi phục phiên gần nhất." : "Tự động lưu đang bật.");

  const ended = round >= MAX_ROUNDS || collapse !== null;
  const current = scenarios[round];
  const ending = useMemo(() => getEnding(stats), [stats]);
  const managementAssessment = useMemo(
    () => (ended ? createManagementAssessment({ stats, score, decisionLog, collapse }) : null),
    [ended, stats, score, decisionLog, collapse]
  );
  const briefing = current ? scenarioBriefings[current.type] : null;
  const whenLabel = current
    ? `Thời điểm phát sinh: ${formatDateVN(scenarioSchedule[current.type].eventDate)} (${scenarioSchedule[current.type].context}).`
    : "";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (ended) {
      clearSavedCampaign();
      setSaveStatus("Chiến dịch đã kết thúc. Bản lưu tạm đã được xóa.");
      return;
    }

    const snapshot = {
      round,
      stats,
      score,
      notes,
      moods,
      scenarios,
      collapse,
      pendingDecision,
      decisionLog
    };

    window.localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    setSaveStatus("Đang tự động lưu tiến trình.");
  }, [round, stats, score, notes, moods, scenarios, collapse, pendingDecision, decisionLog, ended]);

  useEffect(() => {
    if (ended) {
      setShowFinalModal(true);
    }
  }, [ended]);

  const createDecisionReport = (scenario, choice, nextStats) => {
    const deltaLines = [
      `Tăng trưởng: ${choice.effects.growth >= 0 ? "+" : ""}${choice.effects.growth}`,
      `Công bằng: ${choice.effects.equity >= 0 ? "+" : ""}${choice.effects.equity}`,
      `Niềm tin xã hội: ${choice.effects.trust >= 0 ? "+" : ""}${choice.effects.trust}`,
      `Năng lực điều tiết: ${choice.effects.regulation >= 0 ? "+" : ""}${choice.effects.regulation}`
    ];

    const socialOutcome =
      choice.effects.equity + choice.effects.trust >= 12
        ? "Mặt bằng đồng thuận xã hội được cải thiện, rủi ro xung đột lợi ích giảm trong ngắn hạn."
        : choice.effects.equity + choice.effects.trust <= -8
          ? "Xã hội xuất hiện tín hiệu bất mãn rõ hơn, nguy cơ phản ứng dây chuyền trong các nhóm yếu thế tăng."
          : "Tác động xã hội ở mức trung tính, cần theo dõi thêm dữ liệu thực thi trước khi mở rộng chính sách.";

    const marketOutcome =
      choice.effects.growth + choice.effects.innovation >= 10
        ? "Thị trường nhận tín hiệu tích cực về động lực đầu tư và đổi mới công nghệ."
        : choice.effects.growth + choice.effects.innovation <= -5
          ? "Động lực thị trường suy giảm, doanh nghiệp có xu hướng trì hoãn đầu tư mới."
          : "Động lực thị trường duy trì mức vừa phải, chưa tạo chuyển biến mạnh về năng suất.";

    const governanceOutcome =
      nextStats.regulation >= 65
        ? "Năng lực quản trị đang ở vùng an toàn, Nhà nước đủ dư địa điều chỉnh nếu xuất hiện cú sốc mới."
        : nextStats.regulation <= 35
          ? "Năng lực quản trị giảm về vùng rủi ro, sai số chính sách và xung đột thực thi dễ tăng."
          : "Năng lực quản trị ở mức trung bình, cần tăng giám sát và phối hợp liên ngành.";

    const baseDate = scenarioSchedule[scenario.type]?.eventDate || "2025-01-15";
    const timeline = [
      {
        label: `Mốc 2 tuần (${formatDateVN(addDays(baseDate, 14))})`,
        date: addDays(baseDate, 14),
        tone: choice.effects.trust >= 4 ? "positive" : choice.effects.trust <= -3 ? "risk" : "neutral",
        text:
          choice.effects.trust >= 0
            ? "Dư luận phản hồi tương đối tích cực, mức độ tranh luận chính sách vẫn trong tầm kiểm soát."
            : "Dư luận phản ứng tiêu cực rõ rệt, áp lực truyền thông và kiến nghị xã hội tăng nhanh."
      },
      {
        label: `Mốc 3 tháng (${formatDateVN(addMonths(baseDate, 3))})`,
        date: addMonths(baseDate, 3),
        tone: choice.effects.equity >= 4 ? "positive" : choice.effects.equity <= -3 ? "risk" : "neutral",
        text:
          choice.effects.equity >= 0
            ? "Tác động phân phối bắt đầu thể hiện, nhóm dễ tổn thương nhận tín hiệu cải thiện cụ thể hơn."
            : "Khoảng cách lợi ích giữa các nhóm bộc lộ rõ hơn, nguy cơ bất mãn tích tụ tăng."
      },
      {
        label: `Mốc 12 tháng (${formatDateVN(addMonths(baseDate, 12))})`,
        date: addMonths(baseDate, 12),
        tone: nextStats.growth >= 55 && nextStats.regulation >= 50 ? "positive" : nextStats.growth <= 40 || nextStats.regulation <= 35 ? "risk" : "neutral",
        text:
          nextStats.growth >= 55 && nextStats.regulation >= 50
            ? "Nếu duy trì nhất quán, chính sách có thể tạo nền tăng trưởng ổn định và giảm xung đột lợi ích dài hạn."
            : "Nếu không điều chỉnh bổ sung, nền kinh tế có thể xuất hiện lệch pha tăng trưởng - công bằng trong chu kỳ kế tiếp."
      }
    ];

    return {
      scenarioType: scenario.type,
      chosenTitle: choice.title,
      immediate: `Bạn đã chọn phương án: ${choice.title}. Quyết định này tạo tác động tức thời lên cân bằng lợi ích giữa Nhà nước, doanh nghiệp, người lao động và cộng đồng.`,
      deltaLines,
      socialOutcome,
      marketOutcome,
      governanceOutcome,
      timeline
    };
  };

  const onAskChoose = (choice) => {
    if (pendingDecision || ended || confirmChoice) {
      return;
    }

    setConfirmChoice(choice);
  };

  const onConfirmChoose = () => {
    if (!confirmChoice || pendingDecision || ended) {
      return;
    }

    const choice = confirmChoice;
    setConfirmChoice(null);

    const nextStats = {
      growth: clamp(stats.growth + choice.effects.growth, 0, 100),
      equity: clamp(stats.equity + choice.effects.equity, 0, 100),
      trust: clamp(stats.trust + choice.effects.trust, 0, 100),
      regulation: clamp(stats.regulation + choice.effects.regulation, 0, 100),
      innovation: clamp(stats.innovation + choice.effects.innovation, 0, 100)
    };

    setStats(nextStats);

    const addScore =
      choice.effects.growth * 1.2 +
      choice.effects.equity * 1.3 +
      choice.effects.trust * 1.4 +
      choice.effects.regulation * 1.1 +
      choice.effects.innovation;

    setScore((prev) => prev + addScore);
    setMoods(choice.moods);
    setNotes((prev) => [...prev, choice.theory, theoryCore[round % theoryCore.length]]);
    setDecisionLog((prev) => [
      ...prev,
      {
        round: round + 1,
        scenarioType: current.type,
        scenarioTitle: current.title,
        choiceTitle: choice.title,
        effects: choice.effects
      }
    ]);
    setPendingDecision(createDecisionReport(current, choice, nextStats));

    const collapseResult = getCollapseResult(nextStats);
    if (collapseResult) {
      setPendingDecision((prev) => ({ ...prev, collapseResult }));
      return;
    }
  };

  const onCancelChoose = () => {
    setConfirmChoice(null);
  };

  const onContinue = () => {
    if (!pendingDecision) {
      return;
    }

    if (pendingDecision.collapseResult) {
      setCollapse(pendingDecision.collapseResult);
      setNotes((prev) => [
        ...prev,
        "Cảnh báo hệ thống: các cân đối vĩ mô - xã hội đã vượt ngưỡng an toàn.",
        "Chiến dịch dừng sớm vì nền kinh tế mất điều hòa."
      ]);
      setPendingDecision(null);
      return;
    }

    setRound((prev) => prev + 1);
    setPendingDecision(null);
  };

  const onReset = () => {
    clearSavedCampaign();
    setRound(0);
    setStats(initialStats);
    setScore(0);
    setMoods(baseMoods);
    setNotes(baseNotes);
    setScenarios(pickScenarioSet());
    setCollapse(null);
    setPendingDecision(null);
    setDecisionLog([]);
    setConfirmChoice(null);
    setShowFinalModal(false);
    setSaveStatus("Đã xóa bản lưu cũ và tạo chiến dịch mới.");
  };

  const onClearSavedOnly = () => {
    clearSavedCampaign();
    setSaveStatus("Đã xóa bản lưu trình duyệt.");
  };

  return (
    <>
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <main className="game-shell">
        <header className="top-banner">
          <div className="banner-topline">
            <p className="mode-tag">Single Player | Việt Nam 2025 | React</p>
            <button type="button" className="clear-save-btn" onClick={onClearSavedOnly}>
              Xóa bản lưu
            </button>
          </div>
          <h1>CỐ VẤN KINH TẾ: CÂN BẰNG LỢI ÍCH</h1>
          <p className="intro">
            Bạn là cố vấn kinh tế quốc gia. Mỗi quý, bạn chọn chính sách để vừa thúc đẩy tăng trưởng,
            vừa giữ công bằng xã hội, vừa tăng niềm tin.
          </p>
          <p className="save-status">{saveStatus}</p>
        </header>

        <section className="hud" aria-label="Bảng thông số quốc gia">
          {[
            ["Tăng trưởng", stats.growth],
            ["Công bằng", stats.equity],
            ["Niềm tin xã hội", stats.trust],
            ["Năng lực điều tiết nhà nước", stats.regulation]
          ].map(([label, value]) => (
            <article className="stat-card" key={label}>
              <h2>{label}</h2>
              <div className="meter">
                <span style={{ width: `${value}%`, background: statColor(value) }} />
              </div>
              <p>{value}</p>
            </article>
          ))}
        </section>

        <section className="scenario" aria-live="polite">
          <div className="scenario-topline">
            <p id="roundLabel">{collapse ? "Chiến dịch dừng sớm" : ended ? "Chiến dịch kết thúc" : `Quý ${round + 1} / ${MAX_ROUNDS}`}</p>
            <p className="type-pill">{collapse ? "Khủng hoảng" : ended ? "Tổng kết" : current.type}</p>
          </div>
          <h2>{collapse ? "Nền kinh tế đã rơi vào trạng thái mất điều hòa." : ended ? `Bạn đã hoàn thành ${MAX_ROUNDS} quyết sách chiến lược.` : current.title}</h2>
          <p>{collapse ? "Các chỉ số nền tảng đã vượt ngưỡng an toàn. Hệ thống dừng để tránh đổ vỡ sâu hơn." : ended ? "Bảng tổng kết đã bật ở dạng popup để bạn xem ngay kết quả." : current.text}</p>

          {!ended && briefing && (
            <div className="briefing-box">
              <p className="briefing-when">{whenLabel}</p>
              <p className="briefing-context">{briefing.deepContext}</p>
              <ul className="briefing-list">
                {briefing.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {!ended && (
            <div className="choices">
              {current.choices.map((choice) => (
                <button key={choice.title} type="button" className="choice-btn" onClick={() => onAskChoose(choice)} disabled={Boolean(pendingDecision || confirmChoice)}>
                  <span className="choice-title">{choice.title}</span>
                  <span className="choice-note">{choice.note}</span>
                </button>
              ))}
            </div>
          )}

          {pendingDecision && (
            <article className="decision-result">
              <h3>Phản ứng sau quyết định</h3>
              <p className="result-intro">{pendingDecision.immediate}</p>
              <p className="result-choice"><strong>Phương án đã chọn:</strong> {pendingDecision.chosenTitle}</p>
              <ul className="result-deltas">
                {pendingDecision.deltaLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p><strong>Kết quả xã hội:</strong> {pendingDecision.socialOutcome}</p>
              <p><strong>Kết quả thị trường:</strong> {pendingDecision.marketOutcome}</p>
              <p><strong>Kết quả quản trị:</strong> {pendingDecision.governanceOutcome}</p>
              <div className="timeline-box">
                <p className="timeline-title">Khi nào các tác động này xảy ra?</p>
                <div className="timeline-progress" aria-hidden="true">
                  {pendingDecision.timeline.map((item, index) => (
                    <div
                      className={`progress-step tone-${item.tone}`}
                      key={`${item.label}-${item.date}`}
                      style={{ "--step-index": index }}
                    >
                      <span className="progress-dot" />
                      <span className="progress-label">{index === 0 ? "2 tuần" : index === 1 ? "3 tháng" : "12 tháng"}</span>
                      {index < pendingDecision.timeline.length - 1 && <span className="progress-line" />}
                    </div>
                  ))}
                </div>
                <div className="timeline-legend" aria-label="Chú giải màu timeline">
                  <span className="legend-item legend-positive">Xanh: thuận lợi</span>
                  <span className="legend-item legend-neutral">Vàng: cần theo dõi</span>
                  <span className="legend-item legend-risk">Đỏ: rủi ro cao</span>
                </div>
                <ul>
                  {pendingDecision.timeline.map((item) => (
                    <li key={`${item.label}-${item.date}`} className={`timeline-item timeline-item-${item.tone}`}>
                      <strong>{item.label}:</strong> {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="next-btn-row">
                <button type="button" className="next-btn" onClick={onContinue}>
                  {pendingDecision.collapseResult ? "Xác nhận dừng chiến dịch" : "Qua kịch bản tiếp theo"}
                </button>
              </div>
            </article>
          )}
        </section>

        <section className="actors" aria-label="Tâm trạng các chủ thể">
          <h3>Cảm xúc các chủ thể sau quyết định</h3>
          <div className="actor-grid">
            {[
              ["Người dân", moods.citizen],
              ["Người lao động", moods.worker],
              ["Doanh nghiệp tư nhân", moods.business],
              ["Nhà nước", moods.state]
            ].map(([name, mood]) => (
              <article className="actor-card" key={name}>
                <div className={`portrait mood-${mood.tone}`} aria-hidden="true">
                  <span className="eye left" />
                  <span className="eye right" />
                  <span className="mouth" />
                </div>
                <div>
                  <h4>{name}</h4>
                  <p>{mood.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="knowledge" aria-label="Sổ tay lý thuyết">
          <h3>Sổ tay lý thuyết</h3>
          <ol>
            {notes
              .concat(ended ? [`Tổng kết điểm chiến lược: ${Math.round(score)}.`] : [])
              .map((line, idx) => (
                <li key={`${idx}-${line.slice(0, 24)}`}>{line}</li>
              ))}
          </ol>
        </section>
      </main>

      {confirmChoice && !ended && (
        <section className="modal-overlay" role="dialog" aria-modal="true" aria-label="Xác nhận quyết định chính sách">
          <div className="modal-card confirm-modal">
            <h3>Xác nhận lựa chọn</h3>
            <p>Bạn có chắc muốn chọn phương án này không?</p>
            <p><strong>{confirmChoice.title}</strong></p>
            <p>{confirmChoice.note}</p>
            <div className="modal-actions">
              <button type="button" className="modal-btn secondary" onClick={onCancelChoose}>Xem lại</button>
              <button type="button" className="modal-btn primary" onClick={onConfirmChoose}>Chốt quyết định</button>
            </div>
          </div>
        </section>
      )}

      {ended && showFinalModal && (
        <section className="modal-overlay" role="dialog" aria-modal="true" aria-label="Tổng kết chiến dịch">
          <div className="modal-card final-modal" id="finalPanel">
            <div className="modal-head">
              <h2>{collapse ? collapse.title : ending.title}</h2>
              <button type="button" className="modal-close" onClick={() => setShowFinalModal(false)}>Đóng</button>
            </div>
            <p>{collapse ? collapse.text : ending.text}</p>
            <ul>
              {(collapse ? collapse.bullets : ending.bullets).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            {managementAssessment && (
              <article className="assessment-box" aria-label="Đánh giá năng lực điều phối kinh tế">
                <h3>Đánh giá năng lực quản lý điều phối kinh tế</h3>
                <p>
                  <strong>Điểm tổng hợp:</strong> {managementAssessment.overallScore}/100 ({managementAssessment.grade})
                </p>
                <p>
                  <strong>Phong cách điều phối:</strong> {managementAssessment.style} | <strong>Số quyết sách đã xử lý:</strong> {managementAssessment.roundsPlayed}
                </p>
                <p>{managementAssessment.intelligenceNote}</p>

                <div className="assessment-grid">
                  {managementAssessment.dimensions.map((item) => (
                    <div key={item.name} className="assessment-item">
                      <p className="assessment-name">{item.name}</p>
                      <p className="assessment-score">{item.score}/100 - {item.band}</p>
                    </div>
                  ))}
                </div>

                <p><strong>Điểm mạnh nổi bật:</strong></p>
                <ul>
                  {managementAssessment.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <p><strong>Rủi ro cần lưu ý:</strong></p>
                <ul>
                  {managementAssessment.risks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <p><strong>Khuyến nghị chu kỳ tiếp theo:</strong></p>
                <ul>
                  {managementAssessment.actions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            )}

            <div className="modal-actions final-actions">
              <button type="button" className="modal-btn secondary" onClick={() => setShowFinalModal(false)}>
                Xem nền phía sau
              </button>
              <button id="restartBtn" type="button" onClick={onReset}>
                Chơi lại với bộ kịch bản mới
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
