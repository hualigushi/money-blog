在HTTPS劫持攻击（“中间人攻击”的一种类型）中，网络中的攻击者会伪装成一个网站（例如facebook.com），并且提供带有攻击者公钥的假证书。

通常，攻击者无法让任何合法的CA来对一个不受攻击者控制的域名的证书进行签名，因此浏览器会检测并阻止这种攻击行为。

但是，如果攻击者可以说服用户安装一个新CA的根证书到浏览器当中，浏览器就会信任攻击者提供的由这个合法CA签发的假证书。

通过这些假证书，攻击者可以模仿任何网站，进而可以篡改网站内容、记录用户在网站上的操作或发表的内容等。

因此，用户不应该安装根CA证书，因为这样就会将原本安全的通信暴露无遗，导致通信被劫持或篡改而不被用户所感知。

