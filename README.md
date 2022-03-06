# 一：运行示例
### 1.swagger接口

![1646562682076](https://github.com/iamjwe/shares-help/blob/master/assets/1646562682076.png)

### 2.选股示例：筛选出今日龙头板块所有主板涨停个股（20220225）

- 选股：/select/limit_select_stock

![1646563325259](https://github.com/iamjwe/shares-help/blob/master/assets/1646563325259.png)

- 选股结果

![1646562966648](https://github.com/iamjwe/shares-help/blob/master/assets/1646562966648.png)

### 3.回测示例：回测该日买入后的收益

- 回测：/backTest/limit_backTest

![1646563359725](https://github.com/iamjwe/shares-help/blob/master/assets/1646563359725.png)

- 回测结果

![1646563086987](https://github.com/iamjwe/shares-help/blob/master/assets/1646563086987.png)

# 二：程序启动
### 1.启动条件
###### 1.环境准备
- mysql环境
- tushare会员

###### 2.配置文件
在程序上传之前，一些私密的文件被ignore掉了：
```
# gitignore
/apps/config.dev.yml
/apps/config.prod.yml
/apps/tushare/tushare.config.ts
```
所以阁下在启动之前应该补充上这两个配置文件，配置规则分别如下：
- apps/tushare/tushare.config.ts
``` 
export const tushare_token =  '你的tushare账户token';
```
- apps/config.dev.yml与apps/config.prod.yml
```
app:
  cors: true
  swagger: true
http:
  host: localhost
  port: 8080
tushare:
  token: xxx # tushare账户的token
  tradeCalBegin: '20210101' # 回测涉及到的交易范围（个人pc最好设置一年以内，多了缓存撑不住数据量）
  presetCache: '20211001' # 必须晚于tradeCalBegin，只在预缓存以trade_date为日期时用到
  useMyDb: true # 使用本地备份数据库（尽量，直接访问tushare远程数据库会大幅受到限制）
data:
  tcp: # service-data微服务配置
    port: 40000
  db:
    mysql:
      type: mysql
      host: 127.0.0.1 # 你的数据库
      port: 3306
      database: nodeQuant
      username: root
      password: '${your password}'
      synchronize: true
notify:
  tcp: # service-notify微服务配置
    port: 50000
  email: # 以谁的名义(from)发邮件给哪些人(to)，下面是用QQ邮箱发邮件的配置
    from:
      domain: qq.com
      name: ${your name}
      user: ${your qq}
      pass: ${your qq email smtp pass}
    to:
      addrs:
        - ${your qq}@qq.com
```
### 2.快速启动
- 启动数据服务
```
  npm run start:data
```
- 启动通知服务
```
  npm run start:notify
```
- 启动核心服务
```
  npm run start
```

# 三：数据源
###  1.数据平台
- 本项目依赖的数据源：https://www.tushare.pro/document/2

### 2.接口测试
- step1：安装ts-node：
``` 
npm install -g typescript
npm install -g ts-node
```
- step2：配置测试token：tushare/tushare.config.ts
```
    export const tushare_token = `${your tushare token}`
```
- step3：ts-node指定运行apps/tushare下的接口文件即可

# 四：联系我

![](https://github.com/iamjwe/shares-help/blob/master/assets/1646561916977.png)

