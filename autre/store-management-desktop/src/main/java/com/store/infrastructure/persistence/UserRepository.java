package com.store.infrastructure.persistence;

import com.store.domain.entity.UserApp;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

import java.util.Optional;

public class UserRepository {
    private final SessionFactory sessionFactory = HibernateUtil.getSessionFactory();

    public Optional<UserApp> findByUsername(String username) {
        try (Session s = sessionFactory.openSession()) {
            return s.createQuery("FROM UserApp WHERE username = :u", UserApp.class)
                    .setParameter("u", username)
                    .uniqueResultOptional();
        }
    }

    public UserApp save(UserApp user) {
        try (Session s = sessionFactory.openSession()) {
            s.beginTransaction();
            UserApp saved;
            if (user.getId() == null) {
                s.persist(user);
                saved = user;
            } else {
                saved = s.merge(user);
            }
            s.getTransaction().commit();
            return saved;
        }
    }
}
