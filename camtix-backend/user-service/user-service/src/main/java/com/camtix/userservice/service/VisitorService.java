package com.camtix.userservice.service;

import com.camtix.userservice.entity.Visitor;
import com.camtix.userservice.repository.VisitorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitorService {

    private final VisitorRepository visitorRepository;

    @Transactional(readOnly = true)
    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Visitor> getAllVisitorsPaged(String search, Pageable pageable) {
        String s = (search == null || search.trim().isEmpty()) ? null : search.trim();
        return visitorRepository.findWithFilters(s, pageable);
    }

    @Transactional
    public void logVisitor(Long userId, String activity) {
        Visitor visitor = Visitor.builder()
                .userId(userId)
                .activity(activity)
                .build();
        visitorRepository.save(visitor);
    }
}
