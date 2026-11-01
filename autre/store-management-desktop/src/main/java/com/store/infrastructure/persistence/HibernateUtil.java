package com.store.infrastructure.persistence;

import com.store.domain.entity.*;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

/**
 * Hibernate session factory for H2 database.
 * Uses embedded H2 with file storage.
 */
public class HibernateUtil {

    private static final SessionFactory sessionFactory = buildSessionFactory();

    private static SessionFactory buildSessionFactory() {
        try {
            Configuration cfg = new Configuration()
                    .addAnnotatedClass(Product.class)
                    .addAnnotatedClass(Customer.class)
                    .addAnnotatedClass(Invoice.class)
                    .addAnnotatedClass(InvoiceLine.class)
                    .addAnnotatedClass(Payment.class)
                    .addAnnotatedClass(PaymentRecord.class)
                    .addAnnotatedClass(Supplier.class)
                    .addAnnotatedClass(PurchaseInvoice.class)
                    .addAnnotatedClass(PurchaseInvoiceLine.class)
                    .addAnnotatedClass(UserApp.class)
                    .setProperty("hibernate.dialect", "org.hibernate.dialect.H2Dialect")
                    .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                    .setProperty("hibernate.connection.url",
                            "jdbc:h2:file:./data/store_db;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE")
                    .setProperty("hibernate.connection.username", "sa")
                    .setProperty("hibernate.connection.password", "")
                    .setProperty("hibernate.hbm2ddl.auto", "update")
                    .setProperty("hibernate.show_sql", "false")
                    .setProperty("hibernate.format_sql", "true");
            return cfg.buildSessionFactory();
        } catch (Throwable ex) {
            throw new ExceptionInInitializerError(ex);
        }
    }

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }
}
