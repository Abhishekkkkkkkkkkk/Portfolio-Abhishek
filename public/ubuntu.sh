#!/bin/bash

# Ensure the script is run as root
if [ "$(id -u)" != "0" ]; then
    echo "The script must be run with sudo"
    exit 1
fi

# Function to read input with a timeout
get_input() {
    local prompt="$1"
    local default="$2"
    local input
    
    # Use /dev/tty to ensure input can be read even when piped
    exec < /dev/tty
    read -p "$prompt" input
    
    if [ -z "$input" ] && [ ! -z "$default" ]; then
        echo "$default"
    else
        echo "$input"
    fi
}

# Prompt for IP and domain input in a robust way
user_ip=$(get_input "Enter the IP address (e.g., 192.168.1.1): ")
user_domain=$(get_input "Enter the domain name (e.g., smkeki.sch.id): ")

# Prompt for MySQL and phpMyAdmin passwords
mysql_root_password=$(get_input "Enter the password for MySQL root user: ")
phpmyadmin_password=$(get_input "Enter the password for phpMyAdmin: ")

# Validate input
if [ -z "$user_ip" ] || [ -z "$user_domain" ] || [ -z "$mysql_root_password" ] || [ -z "$phpmyadmin_password" ]; then
    echo "IP address, domain, MySQL password, and phpMyAdmin password cannot be empty. Please rerun the script."
    exit 1
fi

# Add the universe repository
add-apt-repository universe -y

# Update with timeout and error handling
export DEBIAN_FRONTEND=noninteractive

# Set automatic configuration for MySQL and phpMyAdmin
echo "mysql-server mysql-server/root_password password $mysql_root_password" | debconf-set-selections
echo "mysql-server mysql-server/root_password_again password $mysql_root_password" | debconf-set-selections
echo "phpmyadmin phpmyadmin/dbconfig-install boolean true" | debconf-set-selections
echo "phpmyadmin phpmyadmin/mysql/admin-pass password $mysql_root_password" | debconf-set-selections
echo "phpmyadmin phpmyadmin/mysql/app-pass password $phpmyadmin_password" | debconf-set-selections
echo "phpmyadmin phpmyadmin/reconfigure-webserver multiselect apache2" | debconf-set-selections

# Fix update process
apt-get clean
apt-get update -y

# Install packages with timeout and error handling
apt-get install -y \
    bind9 \
    apache2 \
    mysql-server \
    apache2-utils \
    phpmyadmin \
    samba \
    || { echo "Package installation failed. Check your internet connection and repository."; exit 1; }

# Disable automatic updates safely
systemctl disable apt-daily.timer
systemctl disable apt-daily-upgrade.timer

# Configure DNS
mkdir -p /etc/bind
cat > /etc/resolv.conf <<EOL
nameserver $user_ip
nameserver 8.8.8.8
search $user_domain
options edns0 trust-ad
EOL

# Configure Bind9 zones
reversed_ip=$(echo "$user_ip" | awk -F. '{print $3"."$2"."$1}')

cat > /etc/bind/named.conf.default-zones <<EOL
# Default zones
zone "localhost" {
    type master;
    file "/etc/bind/db.local";
};

zone "127.in-addr.arpa" {
    type master;
    file "/etc/bind/db.127";
};

zone "0.in-addr.arpa" {
    type master;
    file "/etc/bind/db.0";
};

zone "255.in-addr.arpa" {
    type master;
    file "/etc/bind/db.255";
};

# Custom SMK zones
zone "$user_domain" {
     type master;
     file "/etc/bind/smk.db";
 };

zone "$reversed_ip.in-addr.arpa" {
     type master;
     file "/etc/bind/smk.ip";
 };
EOL

# Configure zone file
cat > /etc/bind/smk.db <<EOL
\$TTL    604800
@       IN      SOA     ns.$user_domain. root.$user_domain. (
                        2         ; Serial
                        604800    ; Refresh
                        86400     ; Retry
                        2419200   ; Expire
                        604800 )  ; Negative Cache TTL
;
@       IN      NS      ns.$user_domain.
@       IN      MX 10   $user_domain.
@       IN      A       $user_ip
ns      IN      A       $user_ip
www     IN      CNAME   ns
mail    IN      CNAME   ns
ftp     IN      CNAME   ns
ntp     IN      CNAME   ns
proxy   IN      CNAME   ns
EOL

# Configure PTR file
octet=$(echo "$user_ip" | awk -F. '{print $4}')
cat > /etc/bind/smk.ip <<EOL
@       IN      SOA     ns.$user_domain. root.$user_domain. (
                        2         ; Serial
                        604800    ; Refresh
                        86400     ; Retry
                        2419200   ; Expire
                        604800 )  ; Negative Cache TTL
;
@       IN      NS      ns.$user_domain.
$octet  IN      PTR     ns.$user_domain.
EOL

# Configure Apache
mkdir -p /etc/apache2/sites-available
mkdir -p /var/www

cat > /etc/apache2/sites-available/000-default.conf <<EOL
<VirtualHost $user_ip:80>
        ServerAdmin admin@$user_domain
        ServerName www.$user_domain
        DocumentRoot /var/www
        ErrorLog \${APACHE_LOG_DIR}/error.log
        LogLevel warn
        CustomLog \${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOL

# Create index.php
cat > /var/www/index.php <<EOL
<!DOCTYPE html>
<html>
<body>
    <h1>Welcome to $user_domain Server</h1>
    <?php phpinfo(); ?>
</body>
</html>
EOL

# Set access permissions for /var/www
chmod 777 /var/www/ -R

# Add Samba user in a robust way
echo "Adding Samba user (username: guest)"
useradd guest
echo "Enter password for guest user:"
passwd guest

# Backup Samba configuration file
cp /etc/samba/smb.conf /etc/samba/smb.conf.backup

# Add www share configuration at the end of the file
cat >> /etc/samba/smb.conf <<EOL

[www]
path = /var/www/
browseable = yes
writeable = yes
valid users = guest
admin users = root
EOL

# Set Samba password for the guest user
smbpasswd -a guest

echo "Adding phpMyAdmin configuration to apache2.conf..."
echo "Include /etc/phpmyadmin/apache.conf" >> /etc/apache2/apache2.conf

# Enable Apache modules
a2ensite 000-default.conf
a2enmod rewrite
a2enmod ssl

# Restart services
systemctl restart bind9 || true
systemctl restart apache2 || true
systemctl restart smbd || true

echo "==== Configuration Complete ===="
echo "Domain: $user_domain"