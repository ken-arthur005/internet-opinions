package me.carey.internet_opinion_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import me.carey.internet_opinion_backend.model.Mention;

@Repository
public interface MentionRepository extends JpaRepository<Mention, String> {

    List<Mention> findByBrandIgnoreCase(String brand);
}