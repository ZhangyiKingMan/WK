SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		ZhangYI
-- Create date: 2019/03/24
-- Description:	注册公众号信息
-- =============================================
CREATE PROCEDURE Register_OfficialAccounts 
	-- Add the parameters for the stored procedure here
	--主表
	@public_Id nvarchar(50), 
	@public_Name varchar(50),
	@public_CreateTime datetime,
	@public_CreaterWeiXinName nvarchar(50),
	@public_CreateWeiXInID nvarchar(50),
	@Public_IsWorking bit = 1,
	--服务表
	@Working_Type int = 0, 	-- 服务类型0代表普通，或者没有确定
	@Working_Account nvarchar(20) = NULL,
	@Working_Password nvarchar(30) = NULL,
	@WorKing_UseLoading bit = 1,
	@WorKing_Level tinyint = 0, -- 服务权限为0代表没有特殊服务
	--信息表
	@Info_Name nchar(10),
	@Info_BodyID nvarchar(50),
	@Info_Phone nchar(10),
	@Info_Email nvarchar(50),
	@Info_WeiXinID nvarchar(50),
	@Info_CompanyName nvarchar(50),
	@Info_CompanyLocation nvarchar(50),
	--日志表
	@Log_LastLogIn datetime,
	@Log_LastLogLocation nvarchar(50),
	@Log_FansNumber int = 0

AS
BEGIN
	--声明一个临时变量
	DECLARE @public_index bigint
	--主表中插入相应信息
	INSERT INTO Public_Info (public_Id, public_Name, public_CreateTime, public_CreaterWeiXinName, public_CreateWeiXInID, Public_IsWorking) 
		VALUES				(@public_Id,@public_Name,@public_CreateTime,@public_CreaterWeiXinName,@public_CreateWeiXInID,@Public_IsWorking);
		--插入不成功返回1,成功返回0
		if @@ERROR != 0
			return 1;
	--获取主键
	select @public_index = scope_identity();
	INSERT INTO Public_CreatorInfo (Public_Index,Info_Name, Info_BodyID, Info_Phone, Info_Email, Info_WeiXinID, Info_CompanyName, Info_CompanyLocation)
		VALUES						(@public_index,@Info_Name,@Info_BodyID,@Info_Phone,@Info_Email,@Info_WeiXinID,@Info_CompanyName,@Info_CompanyLocation);
		if @@ERROR != 0
			return 1;
	INSERT INTO Public_WorKingInfo (Public_Index, Working_Type, Working_Account, Working_Password, WorKing_UseLoading, WorKing_Level)
		VALUES						(@public_index,@Working_Type,@Working_Account,@Working_Password,@WorKing_UseLoading,@WorKing_Level);
		if @@ERROR != 0
			return 1;
	INSERT INTO Public_Log (Public_Index, Log_LastLogIn, Log_LastLogLocation, Log_FansNumber)
		VALUES				(@public_index,@Log_LastLogIn,@Log_LastLogLocation,@Log_FansNumber);
		if @@ERROR != 0
			return 1;
		else 
			return 0;
END
GO
