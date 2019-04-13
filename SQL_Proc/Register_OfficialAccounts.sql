USE [zywk_PublicNumber]
GO
/****** Object:  StoredProcedure [dbo].[Register_OfficialAccounts]    Script Date: 2019/4/10 19:21:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		ZhangYI
-- Create date: 2019/03/24
-- Description:	注册公众号信息
-- =============================================
ALTER PROCEDURE [dbo].[Register_OfficialAccounts] 
	-- Add the parameters for the stored procedure here
	--主表
	@publicId nvarchar(50),			--公众号ID
	@publicName varchar(50),		--公众号名字
	@weiXinName nvarchar(50),		--微信名字
	@weiXinID nvarchar(50),			--微信ID
	@publicAppsecret nvarchar(50),	--公众号Appsceret
	@publicAppID nvarchar(20),		--公众号AppID
	--服务表
	@serviceType int = 0, 			-- 服务类型0代表普通，或者没有确定
	@registeAccount nvarchar(20),	--注册的账号
	@registePassword nvarchar(30),	--账号密码
	--信息表
	@userName nchar(10),			--用户姓名
	@userID nvarchar(50),			--用户省份证号
	@userGender bit,				--用户性别
	@userPhone nchar(10),			--用户电话号码
	@userEmail nvarchar(50),		--用户邮箱
	@companyName nvarchar(50),		--公司名称
	@companyAddr nvarchar(50),		--公司地址
	--推荐人ID
	@goodManWeiXinID nvarchar(50)	--推广人微信ID(用于发红包)
AS
BEGIN
	--声明一个临时变量
	DECLARE 
		@public_index bigint,
		@public_CreateTime datetime = CONVERT(varchar(100), GETDATE(), 23),
		@Public_IsWorking bit = 0,	-- 0代表还没使用服务，1代表开始使用服务
		@WorKing_UseLoading bit = 1,-- 用户登陆
		@WorKing_Level tinyint = 0, -- 服务权限为0代表没有特殊服务
			--日志表
		@Log_LastLogIn datetime = null,
		@Log_LastLogLocation nvarchar(50), --登陆地点，后续使用字段
		@Log_FansNumber int = 0		--统计公众号的粉丝数量
	--主表中插入相应信息
	INSERT INTO Public_Info (public_Id, public_Name, public_AppID, public_Appsecret,public_CreateTime, public_CreaterWeiXinName, public_CreateWeiXInID, Public_IsWorking) 
		VALUES				(@publicId,@publicName,@publicAppID,@publicAppsecret,@public_CreateTime,@weiXinName, @weiXinID,@Public_IsWorking);
		--插入不成功返回1,成功返回0
		if @@ERROR != 0
			return 1;
	--获取主键
	select @public_index = scope_identity();
	INSERT INTO Public_CreatorInfo (Public_Index, Info_Name, Info_Gender,Info_BodyID, Info_Phone, Info_Email, Info_WeiXinID, Info_CompanyName, Info_CompanyLocation)
		VALUES						(@public_index,@userName,@userGender,@userID,@userPhone,@userEmail,@weiXinID,@companyName,@companyAddr);
		if @@ERROR != 0
			return 1;
	INSERT INTO Public_WorKingInfo (Public_Index, Working_Type, Working_Account, Working_Password, WorKing_UseLoading, WorKing_Level)
		VALUES						(@public_index,@serviceType,@registeAccount,@registePassword,@WorKing_UseLoading,@WorKing_Level);
		if @@ERROR != 0
			return 1;
	INSERT INTO Public_Log (Public_Index, Log_LastLogIn, Log_LastLogLocation, Log_FansNumber)
		VALUES				(@public_index,@Log_LastLogIn,@Log_LastLogLocation,@Log_FansNumber);
		if @@ERROR != 0
			return 1;
		else 
			return 0;
END
