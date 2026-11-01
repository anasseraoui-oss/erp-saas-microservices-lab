package com.store.infrastructure.persistence;

import com.store.domain.entity.Product;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Product CRUD operations.
 */
public class ProductRepository {

    private final SessionFactory sessionFactory = HibernateUtil.getSessionFactory();

    public List<Product> findAll() {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM Product ORDER BY name", Product.class).list();
        }
    }

    public Optional<Product> findById(Long id) {
        try (Session s = sessionFactory.openSession()) {
            return Optional.ofNullable(s.get(Product.class, id));
        }
    }

    public Product save(Product p) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            Product saved;
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

    public void deleteById(Long id) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            Product p = s.get(Product.class, id);
            if (p != null)
                s.remove(p);
            s.getTransaction().commit();
        }
    }

    public List<Product> findByNameContaining(String term) {
        try (Session s = sessionFactory.openSession()) {
            Query<Product> q = s.createQuery("FROM Product p WHERE LOWER(p.name) LIKE :term ORDER BY p.name",
                    Product.class);
            q.setParameter("term", "%" + term.toLowerCase() + "%");
            return q.list();
        }
    }
}
