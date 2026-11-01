package com.store.infrastructure.persistence;

import com.store.domain.entity.Invoice;
import com.store.domain.entity.InvoiceType;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

import java.util.List;
import java.util.Optional;

public class InvoiceRepository {

    private final SessionFactory sessionFactory = HibernateUtil.getSessionFactory();

    public List<Invoice> findAll() {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM Invoice i LEFT JOIN FETCH i.lines ORDER BY i.date DESC, i.id DESC",
                    Invoice.class).list();
        }
    }

    public List<Invoice> findByType(InvoiceType type) {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery(
                    "FROM Invoice i LEFT JOIN FETCH i.lines WHERE i.type = :t ORDER BY i.date DESC, i.id DESC",
                    Invoice.class)
                    .setParameter("t", type)
                    .list();
        }
    }

    public Optional<Invoice> findById(Long id) {
        try (Session s = sessionFactory.openSession()) {
            Invoice inv = s.get(Invoice.class, id);
            if (inv != null && inv.getLines() != null)
                inv.getLines().size(); // force load lines
            return Optional.ofNullable(inv);
        }
    }

    public Invoice save(Invoice inv) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            Invoice saved;
            if (inv.getId() == null) {
                s.persist(inv);
                saved = inv;
            } else {
                saved = s.merge(inv);
            }
            s.getTransaction().commit();
            return saved;
        }
    }

    public void delete(Long id) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            Invoice inv = s.get(Invoice.class, id);
            if (inv != null)
                s.remove(inv);
            s.getTransaction().commit();
        }
    }
}
