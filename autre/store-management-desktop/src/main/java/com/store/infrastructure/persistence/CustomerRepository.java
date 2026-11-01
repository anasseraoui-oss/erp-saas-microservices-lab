package com.store.infrastructure.persistence;

import com.store.domain.entity.Customer;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

import java.util.List;
import java.util.Optional;

public class CustomerRepository {

    private final SessionFactory sessionFactory = HibernateUtil.getSessionFactory();

    public List<Customer> findAll() {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM Customer ORDER BY name", Customer.class).list();
        }
    }

    public Optional<Customer> findById(Long id) {
        try (Session s = sessionFactory.openSession()) {
            return Optional.ofNullable(s.get(Customer.class, id));
        }
    }

    public Customer save(Customer c) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            Customer saved;
            if (c.getId() == null) {
                s.persist(c);
                saved = c;
            } else {
                saved = s.merge(c);
            }
            s.getTransaction().commit();
            return saved;
        }
    }

    public void update(Customer c) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            s.merge(c);
            s.getTransaction().commit();
        }
    }

    public void delete(Long id) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            Customer c = s.get(Customer.class, id);
            if (c != null)
                s.remove(c);
            s.getTransaction().commit();
        }
    }

    public List<Customer> searchByName(String name) {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM Customer WHERE LOWER(name) LIKE :n ORDER BY name", Customer.class)
                    .setParameter("n", "%" + name.toLowerCase() + "%")
                    .list();
        }
    }
}
