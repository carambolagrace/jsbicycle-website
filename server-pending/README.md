## 基于springboot 创建web server 项目

## 数据库使用 SQLServer 
jdbc:sqlserver://;serverName=sql.w113.vhostgo.com;databaseName=jbea2026
username:jbea2026
passward:32vqyq8pbd

---

## 项目初始化说明

### 技术栈
- JDK 17（Microsoft OpenJDK 17.0.20.1 LTS，位于 `D:\softwar\jdk-17`）
- Spring Boot 2.7.18
- Maven 3.9.16（位于 `D:\softwar\apache-maven-3.9.16`）
- 数据库：SQLServer（Microsoft JDBC Driver）


### 数据库连接配置（application.yml）
- 地址：`sql.w113.vhostgo.com:1433`
- 库名：`jbea2026`
- 用户名：`jbea2026`（可用环境变量 `DB_USERNAME` 覆盖）
- 密码：可用环境变量 `DB_PASSWORD` 覆盖

### 运行方式
新终端中（环境变量已配置）执行：
```shell
mvn spring-boot:run
```
启动后访问健康检查接口验证数据库连通性：
```
GET http://localhost:8080/api/health
```