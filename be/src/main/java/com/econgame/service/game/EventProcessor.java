package com.econgame.service.game;

import com.econgame.entity.Company;
import com.econgame.entity.GameEvent;
import com.econgame.repository.CompanyRepository;
import com.econgame.repository.GameEventRepository;
import com.econgame.repository.GameRoundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventProcessor {

    private final GameEventRepository gameEventRepository;
    private final CompanyRepository companyRepository;
    private final GameRoundRepository gameRoundRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public GameEvent triggerEvent(String type, String description, Long targetCompanyId, int roundNumber) {
        GameEvent event = GameEvent.builder()
                .type(type)
                .description(description)
                .roundNumber(roundNumber)
                .active(true)
                .build();

        switch (type) {
            case "ECONOMIC_CRISIS" -> {
                event.setDescription(description != null ? description : "Khủng hoảng kinh tế! Nhu cầu giảm 50%.");
                event.setEffectJson("{\"demandMultiplier\": 0.5}");
            }
            case "MARKET_BOOM" -> {
                event.setDescription(description != null ? description : "Bùng nổ thị trường! Giá bán tăng 50%, nhu cầu tăng gấp đôi.");
                event.setEffectJson("{\"demandMultiplier\": 2.0, \"priceMultiplier\": 1.5}");
            }
            case "LABOR_LAW" -> {
                event.setDescription(description != null ? description : "Luật lao động mới! Lương tối thiểu: 12$.");
                event.setEffectJson("{\"minimumWage\": 12}");
            }
            case "WORKER_STRIKE" -> {
                event.setDescription(description != null ? description : "Đình công toàn ngành! Công ty lương < 10$ ngừng sản xuất.");
                event.setEffectJson("{\"strikeSalaryThreshold\": 10}");
            }
            case "TAX_POLICY" -> {
                event.setDescription(description != null ? description : "Chính sách thuế mới! Thuế 20% trên doanh thu.");
                event.setEffectJson("{\"taxRate\": 0.2}");
            }
            case "CORRUPTION_SCANDAL" -> {
                if (targetCompanyId != null) {
                    Company target = companyRepository.findById(targetCompanyId).orElse(null);
                    if (target != null) {
                        target.setBudget(target.getBudget().subtract(new BigDecimal("20")));
                        target.setReputation(Math.max(0, target.getReputation() - 20));
                        companyRepository.save(target);
                        event.setDescription(description != null ? description
                                : "🧨 Bê bối tham nhũng tại " + target.getName() + "! -20$ ngân sách, -20 uy tín.");
                    }
                }
                event.setEffectJson("{\"budgetPenalty\": 20, \"reputationPenalty\": 20}");
            }
        }

        event = gameEventRepository.save(event);

        messagingTemplate.convertAndSend("/topic/events", event);
        return event;
    }
}
