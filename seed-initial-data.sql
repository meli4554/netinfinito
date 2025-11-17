USE `netinfi`;

-- Inserir Roles padrão
INSERT INTO `Role` (`id`, `name`) VALUES
(1, 'Administrador'),
(2, 'Gerente'),
(3, 'Operador'),
(4, 'Visualizador')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Inserir Permissões básicas
INSERT INTO `Permission` (`id`, `code`, `description`) VALUES
(1, 'users.create', 'Criar usuários'),
(2, 'users.read', 'Visualizar usuários'),
(3, 'users.update', 'Atualizar usuários'),
(4, 'users.delete', 'Deletar usuários'),
(5, 'products.create', 'Criar produtos'),
(6, 'products.read', 'Visualizar produtos'),
(7, 'products.update', 'Atualizar produtos'),
(8, 'products.delete', 'Deletar produtos'),
(9, 'technicians.create', 'Criar técnicos'),
(10, 'technicians.read', 'Visualizar técnicos'),
(11, 'technicians.update', 'Atualizar técnicos'),
(12, 'technicians.delete', 'Deletar técnicos'),
(13, 'inventory.manage', 'Gerenciar estoque'),
(14, 'transfers.create', 'Criar transferências'),
(15, 'transfers.read', 'Visualizar transferências'),
(16, 'transfers.approve', 'Aprovar transferências'),
(17, 'reports.view', 'Visualizar relatórios')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Associar todas as permissões ao Administrador
INSERT INTO `RolePermission` (`roleId`, `permissionId`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(1, 5), (1, 6), (1, 7), (1, 8),
(1, 9), (1, 10), (1, 11), (1, 12),
(1, 13), (1, 14), (1, 15), (1, 16), (1, 17)
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- Permissões do Gerente
INSERT INTO `RolePermission` (`roleId`, `permissionId`) VALUES
(2, 2), (2, 3), (2, 5), (2, 6), (2, 7),
(2, 9), (2, 10), (2, 11), (2, 13), (2, 14),
(2, 15), (2, 16), (2, 17)
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- Permissões do Operador
INSERT INTO `RolePermission` (`roleId`, `permissionId`) VALUES
(3, 6), (3, 10), (3, 13), (3, 14), (3, 15)
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- Permissões do Visualizador
INSERT INTO `RolePermission` (`roleId`, `permissionId`) VALUES
(4, 2), (4, 6), (4, 10), (4, 15), (4, 17)
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- Usuário Administrador
-- Email: admin@netinfi.com
-- Senha: Admin123!
INSERT INTO `User` (`id`, `email`, `passwordHash`, `name`, `roleId`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cldefault001', 'admin@netinfi.com', '$argon2id$v=19$m=65536,t=3,p=4$0TMIVmJZfHz/RrN8ApUyqg$wATpSA6H+t04CfQ+9hSxs3v7XMB8fDHGl2u4Clb1x/w', 'Administrador do Sistema', 1, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);
