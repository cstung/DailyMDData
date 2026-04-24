CREATE DATABASE IF NOT EXISTS revenue_db;
USE revenue_db;

CREATE TABLE report_daily_revenue (
    rptDate DATE,
    mdName VARCHAR(255),
    orderCount INT DEFAULT 0,
    discountAmt DECIMAL(14,2) DEFAULT 0.00,
    netRevAmt DECIMAL(14,2) DEFAULT 0.00,
    vatNetRevamt DECIMAL(14,2) DEFAULT 0.00,
    totalRevAmt DECIMAL(14,2) DEFAULT 0.00,
    counter_staff_name VARCHAR(255),
    lw_staff_name VARCHAR(255),
    netLeasing DECIMAL(14,2) DEFAULT 0.00,
    vatLeasing DECIMAL(14,2) DEFAULT 0.00,
    totalLeasing DECIMAL(14,2) DEFAULT 0.00,
    PRIMARY KEY (rptDate, mdName)
);
