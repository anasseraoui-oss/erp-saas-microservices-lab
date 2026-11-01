package com.store.infrastructure.persistence;

import com.store.domain.entity.Payment;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

import java.util.List;
import java.util.Optional;

public class PaymentRepository {

    private final SessionFactory sessionFactory = HibernateUtil.getSessionFactory();

    public Optional<Payment> findByInvoiceId(Long invoiceId) {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM Payment p WHERE p.invoiceId = :id", Payment.class)
                    .setParameter("id", invoiceId)
                    .uniqueResultOptional();
        }
    }

    public Payment save(Payment p) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            Payment saved;
            if (p.getId() == null) {
                s.persist(p);
                saved = p;
            } else {
                saved = s.merge(p);
            }
            s.getTransaction().commit();
            return saved;
        }
    }

    public void update(Payment p) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            s.merge(p);
            s.getTransaction().commit();
        }
    }
}
