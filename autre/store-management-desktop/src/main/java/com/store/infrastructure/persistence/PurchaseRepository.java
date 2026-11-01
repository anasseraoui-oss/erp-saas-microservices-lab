package com.store.infrastructure.persistence;

import com.store.domain.entity.InvoiceType;
import com.store.domain.entity.PurchaseInvoice;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

import java.util.List;
import java.util.Optional;

public class PurchaseRepository {

    private final SessionFactory sessionFactory = HibernateUtil.getSessionFactory();

    public List<PurchaseInvoice> findAll() {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM PurchaseInvoice ORDER BY date DESC", PurchaseInvoice.class).list();
        }
    }

    public List<PurchaseInvoice> findByType(InvoiceType type) {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM PurchaseInvoice pi WHERE pi.type = :t ORDER BY pi.date DESC",
                    PurchaseInvoice.class)
                    .setParameter("t", type)
                    .list();
        }
    }

    public Optional<PurchaseInvoice> findById(Long id) {
        try (Session s = sessionFactory.openSession()) {
            return Optional.ofNullable(s.get(PurchaseInvoice.class, id));
        }
    }

    public PurchaseInvoice save(PurchaseInvoice inv) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            PurchaseInvoice saved;
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
            PurchaseInvoice inv = s.get(PurchaseInvoice.class, id);
            if (inv != null)
                s.remove(inv);
            s.getTransaction().commit();
        }
    }
}
