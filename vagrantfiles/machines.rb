# -*- mode: ruby -*-
# -*- encoding: UTF-8 -*-
# vi: set ft=ruby :

#  roles
$box_target = "youske/debian-jessie"
$address_start = "192.168.33.20"

$env_config = {

  :general => {
    :box => $box_target,
    :box_update => false,
    :private_ipaddr => $address_start,
    :intnet => "developvm",
    :common_bootstrap_path => "bootstrap.sh"
  },

  :roles => [
    {
      :active => true,
      :name => "vmachine",
      :cpus => 2,
      :memory => 256,
      :bind_ports => [[8080,8080]],
      :mount => [ ["..","/app"] ],
      :gui => false,
      :paravirtprovider => 'kvm',
      :bootstrap_path => 'bootstrap.sh'
    }
  ]
}
