package com.store.infrastructure.persistence;

import com.store.domain.entity.Supplier;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

import java.util.List;
import java.util.Optional;

public class SupplierRepository {

    private final SessionFactory sessionFactory = HibernateUtil.getSessionFactory();

    public List<Supplier> findAll() {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM Supplier ORDER BY name", Supplier.class).list();
        }
    }

    public Optional<Supplier> findById(Long id) {
        try (Session s = sessionFactory.openSession()) {
            return Optional.ofNullable(s.get(Supplier.class, id));
        }
    }

    public Supplier save(Supplier sup) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            Supplier saved;
            if (sup.getId() == null) {
                s.persist(sup);
                saved = sup;
            } else {
                saved = s.merge(sup);
            }
            s.getTransaction().commit();
            return saved;
        }
    }

    public void delete(Long id) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            Supplier sup = s.get(Supplier.class, id);
            if (sup != null)
                s.remove(sup);
            s.getTransaction().commit();
        }
    }

    public List<Supplier> searchByName(String name) {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM Supplier WHERE LOWER(name) LIKE :n ORDER BY name", Supplier.class)
                    .setParameter("n", "%" + name.toLowerCase() + "%")
                    .list();
        }
    }
}
