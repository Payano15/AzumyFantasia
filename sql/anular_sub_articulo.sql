DELIMITER $$

CREATE PROCEDURE anular_sub_articulo(
    IN id INT
	IN idsubatic int
)
BEGIN
    UPDATE sub_articulo 
    SET estatus = 'ANU'
    WHERE id = id
	and idsubartic = idsubartic;
END $$

DELIMITER ;